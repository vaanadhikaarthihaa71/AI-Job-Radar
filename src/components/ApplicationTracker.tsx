import React from 'react';
import { Job } from '../types/job';
import { JobStatus } from '../hooks/useJobStatus';
import { JobCard } from './JobCard';
import { EmptyState } from './EmptyState';
import { CheckCircle, Bookmark, EyeOff, ArrowRight } from 'lucide-react';

interface ApplicationTrackerProps {
  jobs: Job[];
  activeTab: 'saved' | 'applied' | 'hidden';
  onTabChange: (tab: 'saved' | 'applied' | 'hidden') => void;
  getJobStatus: (id: string) => JobStatus;
  onSetStatus: (id: string, status: JobStatus) => void;
  onToggleSave: (id: string) => void;
  onOpenApplyModal: (job: Job) => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  jobs,
  activeTab,
  onTabChange,
  getJobStatus,
  onSetStatus,
  onToggleSave,
  onOpenApplyModal,
}) => {
  const tabJobs = jobs.filter((j) => getJobStatus(j.id) === activeTab);

  const stages = [
    { id: 'saved', label: 'SAVED', count: jobs.filter((j) => getJobStatus(j.id) === 'saved').length },
    { id: 'applied', label: 'APPLIED', count: jobs.filter((j) => getJobStatus(j.id) === 'applied').length },
    { id: 'screening', label: 'SCREENING', count: jobs.filter((j) => getJobStatus(j.id) === 'screening').length },
    { id: 'interview', label: 'INTERVIEW', count: jobs.filter((j) => getJobStatus(j.id) === 'interview').length },
    { id: 'offer', label: 'OFFER', count: jobs.filter((j) => getJobStatus(j.id) === 'offer').length },
  ];

  return (
    <div className="py-6 space-y-6 animate-fade-in font-sans">
      
      {/* Header & Pipeline Visualizer */}
      <div className="pb-4 border-b border-line dark:border-line-dark space-y-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-ink dark:text-ink-dark tracking-tight">
            Application Pipeline
          </h2>
          <p className="text-sm font-sans text-ink-muted dark:text-ink-dark-muted mt-1.5">
            Track and manage your application lifecycle from saved opportunities to interview offers.
          </p>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {stages.map((st, i) => (
            <div
              key={st.id}
              onClick={() => {
                if (st.id === 'saved' || st.id === 'applied') {
                  onTabChange(st.id as any);
                }
              }}
              className={`p-3.5 border rounded-sm transition-all cursor-pointer ${
                activeTab === st.id
                  ? 'border-signal bg-signal/5 text-ink dark:text-ink-dark font-semibold'
                  : 'border-line dark:border-line-dark bg-paper-surface dark:bg-paper-dark-surface text-ink-muted dark:text-ink-dark-muted hover:border-ink dark:hover:border-ink-dark'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
                <span>STAGE {i + 1}</span>
                <span className="font-bold text-signal">{st.count}</span>
              </div>
              <div className="text-xs font-sans font-semibold text-ink dark:text-ink-dark mt-1 flex items-center justify-between">
                <span>{st.label}</span>
                {i < stages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-ink-muted dark:text-ink-dark-muted hidden sm:inline" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-line dark:border-line-dark pb-3 font-sans text-xs">
        <button
          onClick={() => onTabChange('saved')}
          className={`px-3.5 py-1.5 rounded-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'saved'
              ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-semibold'
              : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-signal" />
          <span>Saved Opportunities ({stages[0].count})</span>
        </button>

        <button
          onClick={() => onTabChange('applied')}
          className={`px-3.5 py-1.5 rounded-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'applied'
              ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-semibold'
              : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-state-success" />
          <span>Applications Submitted ({stages[1].count})</span>
        </button>

        <button
          onClick={() => onTabChange('hidden')}
          className={`px-3.5 py-1.5 rounded-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'hidden'
              ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-semibold'
              : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>Hidden List</span>
        </button>
      </div>

      {/* Job Rows Feed */}
      {tabJobs.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <div className="divide-y divide-line dark:divide-line-dark border border-line dark:border-line-dark rounded-sm">
          {tabJobs.map((job) => (
            <div key={job.id} className="relative">
              <JobCard
                job={job}
                status={getJobStatus(job.id)}
                onSetStatus={(s) => onSetStatus(job.id, s)}
                onToggleSave={() => onToggleSave(job.id)}
                onOpenApplyModal={onOpenApplyModal}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
