import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Set CORS & Content-Type
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  let jobs: any[] = [];

  // 1. Try reading local data/jobs.json
  try {
    const jobsFilePath = path.resolve(process.cwd(), 'data/jobs.json');
    if (fs.existsSync(jobsFilePath)) {
      const content = fs.readFileSync(jobsFilePath, 'utf-8');
      jobs = JSON.parse(content);
    }
  } catch (err) {
    console.warn('[API /api/jobs]: Error reading data/jobs.json:', err);
  }

  // 2. Try Supabase REST fallback if env variables present and local file empty
  if (jobs.length === 0) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/jobs?select=*&order=detected_at.desc&limit=500`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });
        if (response.ok) {
          jobs = await response.json();
        }
      } catch (sbErr) {
        console.warn('[API /api/jobs]: Error querying Supabase REST:', sbErr);
      }
    }
  }

  return res.status(200).json(jobs);
}
