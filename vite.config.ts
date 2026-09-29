import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

// Rate Limiter Memory Store for local dev
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
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

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-jobs-and-chat-api',
      configureServer(server) {
        // POST/GET /api/scan (Trigger Python AI Crawler)
        server.middlewares.use('/api/scan', (req, res, next) => {
          if (req.url !== '/' && req.url !== '') return next();
          const pythonScript = path.resolve(__dirname, 'load_real_jobs.py');

          exec(`python "${pythonScript}"`, (error: any, stdout: string, stderr: string) => {
            if (error) {
              console.error('[Vite /api/scan error]:', error, stderr);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to run python crawler', details: stderr || error.message }));
              return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                message: 'Live AI Scraper executed successfully!',
                stdout: stdout.slice(-300),
              })
            );
          });
        });

        // GET /api/jobs
        server.middlewares.use('/api/jobs', (req, res, next) => {
          if (req.url !== '/' && req.url !== '') return next();
          const jobsFilePath = path.resolve(__dirname, 'data/jobs.json');
          if (fs.existsSync(jobsFilePath)) {
            const data = fs.readFileSync(jobsFilePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
          }
        });

        // POST /api/chat
        server.middlewares.use('/api/chat', async (req, res, next) => {
          if (req.method !== 'POST') return next();

          const clientIp = req.socket.remoteAddress || '127.0.0.1';
          const rateLimit = checkRateLimit(clientIp);

          if (!rateLimit.allowed) {
            res.statusCode = 429;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'Rate limit exceeded. Maximum 20 chat queries per hour allowed per browser session.',
              })
            );
            return;
          }

          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { message, history } = body;

              if (!message || typeof message !== 'string') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Message payload required.' }));
                return;
              }

              // Read jobs from data/jobs.json
              let allJobs: any[] = [];
              const jobsFilePath = path.resolve(__dirname, 'data/jobs.json');
              if (fs.existsSync(jobsFilePath)) {
                allJobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf-8'));
              }

              const queryLower = message.toLowerCase();
              const nowMs = Date.now();
              const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

              // Filter top 40 relevant jobs
              const filtered = allJobs.filter((job: any) => {
                const detectedMs = new Date(job.detected_at || job.posted_at || 0).getTime();
                const isRecent = !isNaN(detectedMs) && nowMs - detectedMs <= sevenDaysMs;

                const matchesKeyword =
                  (job.title && job.title.toLowerCase().includes(queryLower)) ||
                  (job.company && job.company.toLowerCase().includes(queryLower)) ||
                  (job.location && job.location.toLowerCase().includes(queryLower)) ||
                  (job.industry && job.industry.toLowerCase().includes(queryLower)) ||
                  (job.matched_skills && job.matched_skills.some((s: string) => s.toLowerCase().includes(queryLower))) ||
                  (job.description && job.description.toLowerCase().includes(queryLower));

                return isRecent || matchesKeyword;
              });

              filtered.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
              const relevantJobs = filtered.slice(0, 40);

              const jobsContext = relevantJobs.map((j: any) => ({
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

              const trimmedHistory = Array.isArray(history) ? history.slice(-10) : [];
              const formattedMessages = [
                ...trimmedHistory.map((h: any) => ({
                  role: h.role === 'user' ? 'user' : 'assistant',
                  content: String(h.content),
                })),
                { role: 'user', content: message },
              ];

              const apiKey = process.env.ANTHROPIC_API_KEY;

              if (!apiKey) {
                // Return grounded data with top relevant jobs summary when key is not set
                const matchedCompanies = Array.from(new Set(relevantJobs.map((j: any) => j.company).filter(Boolean)));
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    reply: `Found ${relevantJobs.length} grounded jobs in your database matching '${message}'. Top companies: ${matchedCompanies.slice(0, 4).join(', ')}. (Note: Set ANTHROPIC_API_KEY for live Claude-driven answers)`,
                    referencedJobs: relevantJobs.slice(0, 4),
                  })
                );
                return;
              }

              const anthropic = new Anthropic({ apiKey });
              const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                system: systemPrompt,
                messages: formattedMessages as any,
              });

              let responseText = '';
              const firstContent = response.content[0];
              if (firstContent && 'text' in firstContent) {
                responseText = firstContent.text;
              }

              const referencedJobs = relevantJobs.filter(
                (j: any) =>
                  (j.company && responseText.toLowerCase().includes(j.company.toLowerCase())) ||
                  (j.title && responseText.toLowerCase().includes(j.title.toLowerCase()))
              ).slice(0, 4);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  reply: responseText,
                  referencedJobs: referencedJobs.length > 0 ? referencedJobs : relevantJobs.slice(0, 2),
                })
              );
            } catch (err: any) {
              console.error('[Vite /api/chat error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Error processing chat request' }));
            }
          });
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
