import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exec } from 'child_process';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const pythonScript = path.resolve(process.cwd(), 'load_real_jobs.py');
    exec(`python "${pythonScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('[API Scan Error]:', error);
        return res.status(500).json({ error: 'Failed to run python crawler', details: stderr });
      }

      return res.status(200).json({
        success: true,
        message: 'Live AI Scraper executed successfully!',
        stdout: stdout.slice(-300),
      });
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error triggering scanner' });
  }
}
