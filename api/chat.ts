import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// Rate Limiter Memory Store (20 requests per hour per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 20;

  const record = rateLimitMap.get(clientIp);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

export interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  is_remote: boolean;
  posted_at?: string;
  detected_at: string;
  job_url: string;
  source: string;
  description?: string;
  score: number;
  matched_skills: string[];
  seniority?: string;
  industry?: string;
  salary?: string;
}

// Load jobs from data/jobs.json or Supabase REST fallback
export async function getRelevantJobs(userQuery: string): Promise<JobItem[]> {
  let allJobs: JobItem[] = [];

  // Try reading local jobs.json first
  try {
    const jobsFilePath = path.resolve(process.cwd(), 'data/jobs.json');
    if (fs.existsSync(jobsFilePath)) {
      const content = fs.readFileSync(jobsFilePath, 'utf-8');
      allJobs = JSON.parse(content);
    }
  } catch (err) {
    console.warn('[API Chat]: Error reading data/jobs.json:', err);
  }

  // If local file wasn't present, fallback to Supabase REST
  if (allJobs.length === 0 && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/jobs?select=*&order=detected_at.desc&limit=200`, {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        allJobs = await res.json();
      }
    } catch (e) {
      console.warn('[API Chat]: Error fetching Supabase REST:', e);
    }
  }

  if (!allJobs || allJobs.length === 0) {
    return [];
  }

  const queryLower = userQuery.toLowerCase();
  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // Filter jobs by keywords or recent 7 days
  const filtered = allJobs.filter((job) => {
    const detectedMs = new Date(job.detected_at || job.posted_at || 0).getTime();
    const isRecent = !isNaN(detectedMs) && (nowMs - detectedMs) <= sevenDaysMs;

    const matchesKeyword =
      job.title.toLowerCase().includes(queryLower) ||
      job.company.toLowerCase().includes(queryLower) ||
      job.location.toLowerCase().includes(queryLower) ||
      (job.industry && job.industry.toLowerCase().includes(queryLower)) ||
      (job.matched_skills && job.matched_skills.some((s) => s.toLowerCase().includes(queryLower))) ||
      (job.description && job.description.toLowerCase().includes(queryLower));

    return isRecent || matchesKeyword;
  });

  // Sort by score or recency
  filtered.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Cap at top 40 jobs
  return filtered.slice(0, 40);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const rateLimit = checkRateLimit(clientIp);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Maximum 20 chat queries per hour allowed per browser session.',
    });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message payload required.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fetch up to 40 relevant job rows
    const relevantJobs = await getRelevantJobs(message);

    // Format job context for LLM
    const jobsContext = relevantJobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      is_remote: j.is_remote,
      salary: j.salary,
      posted_at: j.posted_at,
      detected_at: j.detected_at,
      industry: j.industry,
      source: j.source,
      score: j.score,
      matched_skills: j.matched_skills,
    }));

    const systemPrompt = `You are the assistant for my Job Radar dashboard. Answer only using the JOBS DATA provided below. If the data doesn't contain the answer, say so plainly, never invent a job, company, or number. Be concise. When you reference a job, name the company and title.

JOBS DATA (${jobsContext.length} jobs available):
${JSON.stringify(jobsContext, null, 2)}`;

    // Trim conversation history to last 10 turns
    const trimmedHistory = Array.isArray(history) ? history.slice(-10) : [];
    const formattedMessages = [
      ...trimmedHistory.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: String(h.content),
      })),
      { role: 'user', content: message },
    ];

    if (!apiKey) {
      // Clean fallback if API key is not configured yet
      const matchedCompanies = Array.from(new Set(relevantJobs.map((j) => j.company).filter(Boolean)));
      const topJobs = relevantJobs.slice(0, 5);

      return res.status(200).json({
        reply: `Here are the results from your Job Radar dataset: Found ${relevantJobs.length} matching jobs. Top companies include ${matchedCompanies.slice(0, 4).join(', ')}. (Set ANTHROPIC_API_KEY for live Claude-driven answers)`,
        referencedJobs: topJobs,
      });
    }

    const anthropic = new Anthropic({ apiKey });

    // Call Anthropic API (model claude-sonnet-4-6 or fallback claude-3-5-sonnet-20241022)
    let responseText = '';
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: formattedMessages as any,
      });

      const firstContent = response.content[0];
      if (firstContent && 'text' in firstContent) {
        responseText = firstContent.text;
      }
    } catch (apiErr: any) {
      console.error('[Anthropic API Error]:', apiErr);
      return res.status(500).json({
        error: `Anthropic API Error: ${apiErr.message || 'Service request failed'}`,
      });
    }

    // Match referenced jobs in the AI response to pass structured job cards to UI
    const referencedJobs = relevantJobs.filter(
      (j) =>
        (j.company && responseText.toLowerCase().includes(j.company.toLowerCase())) ||
        (j.title && responseText.toLowerCase().includes(j.title.toLowerCase()))
    ).slice(0, 4);

    return res.status(200).json({
      reply: responseText,
      referencedJobs: referencedJobs.length > 0 ? referencedJobs : relevantJobs.slice(0, 2),
    });
  } catch (err: any) {
    console.error('[API Chat Exception]:', err);
    return res.status(500).json({
      error: `Server Error: ${err.message || 'Unable to process chat request'}`,
    });
  }
}
