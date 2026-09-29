-- Migration: Add user_saved_jobs table with Row Level Security (RLS)
CREATE TABLE IF NOT EXISTS public.user_saved_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('saved', 'applied', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.user_saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create Policy for user isolation
DROP POLICY IF EXISTS "Users can manage their own saved jobs" ON public.user_saved_jobs;
CREATE POLICY "Users can manage their own saved jobs"
    ON public.user_saved_jobs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
