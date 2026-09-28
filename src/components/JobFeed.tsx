import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { JobCard } from './JobCard';
import { EmptyState } from './EmptyState';
import { Job } from '../types/job';
import { Calendar } from 'lucide-react';
import { JobStatus } from '../hooks/useJobStatus';
import { MainTab } from './FilterBar';

interface JobFeedProps {
  jobs: Job[];
  activeTab: MainTab;
  selectedIndex: number;
  getJobStatus: (id: string) => JobStatus;
  onSetStatus: (id: string, status: JobStatus) => void;
  onToggleSave: (id: string) => void;
  onResetSearch: () => void;
}

export const JobFeed: React.FC<JobFeedProps> = ({
  jobs,
  activeTab,
  selectedIndex,
  getJobStatus,
  onSetStatus,
  onToggleSave,
  onResetSearch,
}) => {
  if (jobs.length === 0) {
    if (activeTab === 'saved') return <EmptyState type="saved" />;
    if (activeTab === 'applied') return <EmptyState type="applied" />;
    if (activeTab === 'hidden') return <EmptyState type="hidden" />;
    return <EmptyState type="search" onResetSearch={onResetSearch} />;
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
  let globalItemCounter = 0;

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
              {dateSectionJobs.map((job) => {
                const currentIndex = globalItemCounter++;
                const isSelected = currentIndex === selectedIndex;
                const status = getJobStatus(job.id);

                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    status={status}
                    isSelected={isSelected}
                    onSetStatus={(s) => onSetStatus(job.id, s)}
                    onToggleSave={() => onToggleSave(job.id)}
                  />
                );
              })}
            </div>

          </div>
        );
      })}
    </div>
  );
};
