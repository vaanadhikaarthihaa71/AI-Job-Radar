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
  industry?: string;
  salary?: string;
  isNew?: boolean; // UI flag for accent rule animation
}

export interface UserProfile {
  name: string;
  email: string;
  skills: string[];
  industries: string[];
  experienceLevel: string;
  remoteOnly: boolean;
  minScore: number;
  isAuthenticated: boolean;
}

export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected' | 'polling';

export interface DashboardStats {
  jobsLastHour: number;
  medianDelayMinutes: number | null;
  totalActiveJobs: number;
}

