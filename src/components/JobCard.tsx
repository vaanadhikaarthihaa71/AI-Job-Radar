import React from 'react';
import { Bookmark, ArrowUpRight, Check } from 'lucide-react';
import { Job } from '../types/job';
import { JobStatus } from '../hooks/useJobStatus';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  status: JobStatus;
  isSelected?: boolean;
  onSetStatus: (status: JobStatus) => void;
  onToggleSave: () => void;
  onOpenApplyModal?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  status,
  isSelected = false,
  onSetStatus,
  onToggleSave,
  onOpenApplyModal,
}) => {
  const getRelativeTime = (): string => {
    const rawDate = job.posted_at || job.detected_at;
    if (!rawDate) return 'Recently posted';
    try {
      const dateObj = new Date(rawDate);
      if (isNaN(dateObj.getTime())) return 'Recently posted';
      return formatDistanceToNow(dateObj, { addSuffix: true })
        .replace('about ', '')
        .replace('less than a minute ago', 'just now');
    } catch {
      return 'Recently posted';
    }
  };

  const isHighMatch = job.score >= 80;
  const isSaved = status === 'saved';
  const isApplied = status === 'applied';

  const getMatchExplanation = (): string => {
    const parts: string[] = [];
    if (job.matched_skills && job.matched_skills.length > 0) {
      parts.push(`Skill match: ${job.matched_skills.slice(0, 3).join(', ')}`);
    } else {
      parts.push('Relevant role profile match');
    }
    if (job.is_remote) {
      parts.push('Remote preference matched');
    }
    return parts.join(' · ');
  };

  const handleCardClick = () => {
    if (onOpenApplyModal) {
      onOpenApplyModal(job);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenApplyModal) {
      onOpenApplyModal(job);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group py-4 px-4 border-b border-line dark:border-line-dark hover:bg-paper-surface dark:hover:bg-paper-dark-surface cursor-pointer transition-all ${
        isSelected ? 'bg-paper-surface dark:bg-paper-dark-surface border-l-2 border-l-signal' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Role Title (Inter font-sans), Company, Metadata & Skill tags */}
        <div className="space-y-1.5 flex-1 min-w-0 font-sans">
          
          {/* Job Title & Company */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-sans font-semibold text-ink dark:text-ink-dark group-hover:text-signal transition-colors">
              {job.title}
            </h3>
            <span className="text-sm font-sans font-medium text-ink-muted dark:text-ink-dark-muted">
              {job.company}
            </span>
          </div>

          {/* Location · Remote · Posted time (IBM Plex Mono) · Salary */}
          <div className="flex items-center gap-2 text-xs text-ink-muted dark:text-ink-dark-muted flex-wrap">
            <span>{job.location || 'Multiple Locations'}</span>
            <span>·</span>
            {job.is_remote ? (
              <span className="font-semibold text-signal">Remote</span>
            ) : (
              <span>On-site</span>
            )}
            <span>·</span>
            <span className="font-mono text-[11px]">{getRelativeTime()}</span>
            {job.salary && (
              <>
                <span>·</span>
                <span className="font-mono text-[11px] font-semibold text-state-success">
                  {job.salary}
                </span>
              </>
            )}
          </div>

          {/* Skill tags (IBM Plex Mono font-mono) */}
          {job.matched_skills && job.matched_skills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono">
              {job.matched_skills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-paper-surface dark:bg-paper-dark-surface text-ink/80 dark:text-ink-dark/80 border border-line dark:border-line-dark text-[11px] rounded-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Match explanation snippet */}
          <div className="text-[11px] font-sans text-ink-muted/80 dark:text-ink-dark-muted/80 pt-0.5">
            {getMatchExplanation()}
          </div>

        </div>

        {/* Right: Match Score Pill (IBM Plex Mono) & Quick Actions (Inter) */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/40 dark:border-line-dark/40">
          
          {/* Match Score Badge (IBM Plex Mono) */}
          <div className="flex items-center gap-1.5 font-mono">
            <div
              className={`px-2.5 py-1 rounded-sm text-xs font-bold flex items-center gap-1 ${
                isHighMatch
                  ? 'bg-emerald-500/10 text-state-success border border-emerald-500/30'
                  : job.score >= 60
                  ? 'bg-signal/10 text-signal border border-signal/30'
                  : 'bg-paper-surface dark:bg-paper-dark-surface text-ink-muted dark:text-ink-dark-muted border border-line dark:border-line-dark'
              }`}
            >
              <span>{job.score}</span>
              <span className="text-[10px] uppercase tracking-wider font-sans font-semibold">MATCH</span>
            </div>
          </div>

          {/* Quick Action Buttons (Inter font-sans) */}
          <div className="flex items-center gap-2 font-sans">
            
            {/* Save Button */}
            <button
              onClick={handleSaveClick}
              title={isSaved ? 'Remove from Saved' : 'Save opportunity'}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm border transition-colors flex items-center gap-1 ${
                isSaved
                  ? 'bg-signal/10 border-signal text-signal font-semibold'
                  : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:border-ink dark:hover:border-ink-dark'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-signal text-signal' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Apply Button */}
            <button
              onClick={handleApplyClick}
              className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all flex items-center gap-1 ${
                isApplied
                  ? 'bg-ink/10 dark:bg-ink-dark/10 text-ink dark:text-ink-dark border border-line dark:border-line-dark'
                  : 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark hover:bg-signal dark:hover:bg-signal'
              }`}
            >
              {isApplied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-state-success" />
                  <span>Applied</span>
                </>
              ) : (
                <>
                  <span>Apply</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
