import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { JobCard } from './JobCard';
import { Job } from '../types/job';
import { Calendar, Inbox } from 'lucide-react';

interface JobFeedProps {
  jobs: Job[];
}

export const JobFeed: React.FC<JobFeedProps> = ({ jobs }) => {
  if (jobs.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center my-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">No Jobs Discovered Yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The background crawler is running. New job listings will automatically slide into this stream in real-time.
        </p>
      </div>
    );
  }

  // Group jobs by date section (YYYY-MM-DD string)
  const grouped = jobs.reduce((acc, job) => {
    const rawDate = job.detected_at || job.posted_at || new Date().toISOString();
    const dateObj = new Date(rawDate);
    const dateKey = !isNaN(dateObj.getTime()) ? format(dateObj, 'yyyy-MM-dd') : 'other';

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(job);
    return acc;
  }, {} as Record<string, Job[]>);

  // Format date section title
  const getDateSectionTitle = (dateKey: string): string => {
    if (dateKey === 'other') return 'Recent Listings';
    const dateObj = new Date(dateKey + 'T00:00:00');
    if (isToday(dateObj)) return 'Today';
    if (isYesterday(dateObj)) return 'Yesterday';
    return format(dateObj, 'MMMM d, yyyy');
  };

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      {sortedKeys.map((dateKey) => {
        const dateSectionJobs = grouped[dateKey];
        return (
          <div key={dateKey} className="space-y-3">
            
            {/* Date Section Header */}
            <div className="flex items-center gap-2 px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{getDateSectionTitle(dateKey)}</span>
              <span className="text-slate-600 font-normal">({dateSectionJobs.length})</span>
              <div className="flex-1 h-px bg-slate-800/80 ml-2"></div>
            </div>

            {/* Job Items List */}
            <div className="space-y-3">
              {dateSectionJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

          </div>
        );
      })}
    </div>
  );
};
