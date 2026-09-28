export interface Job {
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
  isNew?: boolean; // UI flag for accent rule animation
}

export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected';

export interface DashboardStats {
  jobsLastHour: number;
  medianDelayMinutes: number | null;
  totalActiveJobs: number;
}
