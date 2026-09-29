import React from 'react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { JobCard } from './JobCard';
import { EmptyState } from './EmptyState';
import { Job } from '../types/job';
import { JobStatus } from '../hooks/useJobStatus';
import { MainTab } from './FilterBar';

interface JobFeedProps {
  jobs: Job[];
  activeTab: MainTab;
  selectedIndex: number;
  isLoading?: boolean;
  getJobStatus: (id: string) => JobStatus;
  onSetStatus: (id: string, status: JobStatus) => void;
  onToggleSave: (id: string) => void;
  onOpenApplyModal: (job: Job) => void;
  onResetSearch: () => void;
  errorMessage?: string | null;
  totalDbJobsCount?: number;
}

export const JobFeed: React.FC<JobFeedProps> = ({
  jobs,
  activeTab,
  selectedIndex,
  isLoading = false,
  getJobStatus,
  onSetStatus,
  onToggleSave,
  onOpenApplyModal,
  onResetSearch,
  errorMessage,
  totalDbJobsCount,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="py-4 border-b border-line dark:border-line-dark space-y-2">
            <div className="h-5 bg-paper-surface dark:bg-paper-dark-surface w-1/3"></div>
            <div className="h-3 bg-paper-surface dark:bg-paper-dark-surface w-1/2"></div>
            <div className="h-3 bg-paper-surface dark:bg-paper-dark-surface w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    if (activeTab === 'saved') return <EmptyState type="saved" />;
    if (activeTab === 'applied') return <EmptyState type="applied" />;
    if (activeTab === 'hidden') return <EmptyState type="hidden" />;
    return (
      <EmptyState
        type="search"
        onResetSearch={onResetSearch}
        errorMessage={errorMessage}
        totalDbJobsCount={totalDbJobsCount}
      />
    );
  }

  // Group jobs by date section (YYYY-MM-DD string)
  const grouped = jobs.reduce((acc, job) => {
    const rawDate = job.posted_at || job.detected_at || new Date().toISOString();
    const dateObj = new Date(rawDate);
    const dateKey = !isNaN(dateObj.getTime()) ? format(dateObj, 'yyyy-MM-dd') : 'other';

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(job);
    return acc;
  }, {} as Record<string, Job[]>);

  const getDateSectionTitle = (dateKey: string, count: number): { title: string; tag: string } => {
    if (dateKey === 'other') return { title: 'Recent Postings', tag: `${count} POSITIONS` };
    const dateObj = new Date(dateKey + 'T00:00:00');
    if (isToday(dateObj)) return { title: 'Today', tag: `${count} NEW POSITIONS` };
    if (isYesterday(dateObj)) return { title: 'Yesterday', tag: `${count} POSITIONS` };
    if (isThisWeek(dateObj)) return { title: `This Week (${format(dateObj, 'EEEE')})`, tag: `${count} POSITIONS` };
    if (isThisMonth(dateObj)) return { title: format(dateObj, 'MMMM d'), tag: `${count} POSITIONS` };
    return { title: format(dateObj, 'MMMM d, yyyy'), tag: `${count} POSITIONS` };
  };

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  let globalItemCounter = 0;

  return (
    <div className="space-y-10 font-sans">
      {sortedKeys.map((dateKey) => {
        const dateSectionJobs = grouped[dateKey];
        const { title, tag } = getDateSectionTitle(dateKey, dateSectionJobs.length);

        return (
          <div key={dateKey} className="space-y-1">
            
            {/* Sticky Date Section Header (DM Serif Display for section title, IBM Plex Mono for tag) */}
            <div className="sticky top-16 z-20 bg-paper/95 dark:bg-paper-dark/95 backdrop-blur-md border-b border-line dark:border-line-dark py-3 mb-2 flex items-baseline justify-between transition-colors duration-200">
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink dark:text-ink-dark tracking-tight">
                {title}
              </h2>
              <span className="text-[10px] font-mono font-semibold uppercase text-ink-muted dark:text-ink-dark-muted tracking-wider">
                {tag}
              </span>
            </div>

            {/* Job Cards List */}
            <div className="divide-y divide-line dark:divide-line-dark border border-line dark:border-line-dark rounded-sm">
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
                    onOpenApplyModal={onOpenApplyModal}
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
