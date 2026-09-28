import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
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
  onResetSearch: () => void;
}

export const JobFeed: React.FC<JobFeedProps> = ({
  jobs,
  activeTab,
  selectedIndex,
  isLoading = false,
  getJobStatus,
  onSetStatus,
  onToggleSave,
  onResetSearch,
}) => {
  // Skeleton Loading Ledger Rows
  if (isLoading) {
    return (
      <div className="space-y-4 py-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="py-4 border-b border-line dark:border-line-dark space-y-2">
            <div className="h-5 bg-paper-subtle dark:bg-paper-dark-subtle w-1/3"></div>
            <div className="h-3 bg-paper-subtle dark:bg-paper-dark-subtle w-1/2"></div>
            <div className="h-3 bg-paper-subtle dark:bg-paper-dark-subtle w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Handle Empty States
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

  // Format date section title (e.g., "Today — 14 new" or "September 28 — 8 listings")
  const getDateSectionTitle = (dateKey: string, count: number): string => {
    if (dateKey === 'other') return `Recent Listings — ${count} jobs`;
    const dateObj = new Date(dateKey + 'T00:00:00');
    if (isToday(dateObj)) return `Today — ${count} new`;
    if (isYesterday(dateObj)) return `Yesterday — ${count} listings`;
    return `${format(dateObj, 'MMMM d')} — ${count} listings`;
  };

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  let globalItemCounter = 0;

  return (
    <div className="space-y-10">
      {sortedKeys.map((dateKey) => {
        const dateSectionJobs = grouped[dateKey];
        return (
          <div key={dateKey} className="space-y-1">
            
            {/* Large Editorial Sticky Date Header */}
            <div className="sticky top-0 z-20 bg-paper dark:bg-paper-dark border-b-2 border-ink dark:border-ink-dark py-2.5 mb-2 flex items-baseline justify-between transition-colors duration-200">
              <h2 className="text-xl lg:text-2xl font-serif font-bold text-ink dark:text-ink-dark tracking-tight">
                {getDateSectionTitle(dateKey, dateSectionJobs.length)}
              </h2>
              <span className="text-xs font-mono text-ink-muted dark:text-ink-dark-muted uppercase">
                SECTION LEDGER
              </span>
            </div>

            {/* Ledger Items List */}
            <div>
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
