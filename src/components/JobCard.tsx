import React from 'react';
import { ExternalLink, Star, CheckCircle, EyeOff } from 'lucide-react';
import { Job } from '../types/job';
import { JobStatus } from '../hooks/useJobStatus';

interface JobCardProps {
  job: Job;
  status: JobStatus;
  isSelected?: boolean;
  onSetStatus: (status: JobStatus) => void;
  onToggleSave: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  status,
  isSelected = false,
  onSetStatus,
  onToggleSave,
}) => {
  // Calculate detection delay string
  const calculateDelayString = (): string | null => {
    if (!job.posted_at || !job.detected_at) return null;

    const posted = new Date(job.posted_at).getTime();
    const detected = new Date(job.detected_at).getTime();

    if (isNaN(posted) || isNaN(detected) || detected < posted) return null;

    const diffMinutes = Math.max(0, Math.round((detected - posted) / (1000 * 60)));
    if (diffMinutes < 60) {
      return `Detected ${diffMinutes} min after posting`;
    } else {
      const hours = (diffMinutes / 60).toFixed(1);
      return `Detected ${hours} hrs after posting`;
    }
  };

  const delayText = calculateDelayString();
  const isHighMatch = job.score >= 70;
  const isSaved = status === 'saved';
  const isApplied = status === 'applied';

  return (
    <div
      className={`ledger-row py-4 border-b border-line dark:border-line-dark transition-colors duration-150 relative ${
        job.isNew ? 'new-ledger-row' : ''
      } ${
        isSelected
          ? 'bg-paper-subtle dark:bg-paper-dark-subtle border-l-4 border-l-signal pl-4'
          : 'px-2'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-3">
        
        {/* Left Column: Ledger Title & Metadata */}
        <div className="space-y-1.5 flex-1 min-w-0">
          
          {/* Large Title */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-baseline gap-1.5"
            >
              <h3 className="text-base lg:text-lg font-sans font-semibold text-ink dark:text-ink-dark group-hover:underline underline-offset-4 decoration-signal">
                {job.title}
              </h3>
              <ExternalLink className="w-3 h-3 text-ink-muted dark:text-ink-dark-muted group-hover:text-signal transition-colors inline shrink-0" />
            </a>

            {/* High-Score Signal Indicator */}
            {isHighMatch && (
              <span className="text-[10px] font-mono uppercase font-bold text-signal px-1.5 py-0.5 bg-signal/10 border border-signal/30">
                HIGH MATCH
              </span>
            )}
          </div>

          {/* Company + Location + Source Metadata in Monospace */}
          <div className="flex items-center gap-2.5 text-xs font-mono text-ink-muted dark:text-ink-dark-muted flex-wrap">
            <span className="font-semibold text-ink dark:text-ink-dark">{job.company}</span>
            <span>/</span>
            <span>{job.location || 'Location Unspecified'}</span>
            {job.is_remote && (
              <>
                <span>/</span>
                <span className="text-signal font-semibold">REMOTE</span>
              </>
            )}
            <span>/</span>
            <span className="uppercase text-[11px]">{job.source}</span>
          </div>

          {/* Detection Delay Badge (Mono) */}
          {delayText && (
            <div className="text-[11px] font-mono text-ink-muted dark:text-ink-dark-muted pt-0.5">
              {delayText}
            </div>
          )}

          {/* Matched Skills (Plain Text Tags) */}
          {job.matched_skills && job.matched_skills.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs font-mono text-ink-muted dark:text-ink-dark-muted">
              <span className="text-[10px] uppercase tracking-wider text-ink/50 dark:text-ink-dark/50">MATCHED:</span>
              {job.matched_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-paper-subtle dark:bg-paper-dark-subtle text-ink dark:text-ink-dark border border-line dark:border-line-dark text-[11px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Numeric Score & Actions */}
        <div className="flex items-center md:flex-col md:items-end justify-between md:justify-start gap-2.5 shrink-0 pt-2 md:pt-0">
          
          {/* Numeric Score Indicator */}
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs text-ink-muted dark:text-ink-dark-muted">SCORE</span>
            <span
              className={`text-sm font-bold ${
                isHighMatch ? 'text-signal' : 'text-ink dark:text-ink-dark'
              }`}
            >
              {job.score}/100
            </span>
          </div>

          {/* Quick Ledger Action Buttons */}
          <div className="flex items-center gap-1 font-mono text-xs">
            
            {/* Save Button */}
            <button
              onClick={onToggleSave}
              title={isSaved ? 'Remove from Saved' : 'Save Job (Shortcut: S)'}
              className={`px-2 py-1 border transition-all text-[11px] flex items-center gap-1 ${
                isSaved
                  ? 'bg-signal/10 border-signal text-signal font-bold'
                  : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted hover:border-ink dark:hover:border-ink-dark'
              }`}
            >
              <Star className={`w-3 h-3 ${isSaved ? 'fill-signal' : ''}`} />
              <span>{isSaved ? 'SAVED' : 'SAVE'}</span>
            </button>

            {/* Mark as Applied */}
            <button
              onClick={() => onSetStatus(isApplied ? 'active' : 'applied')}
              title={isApplied ? 'Mark as Not Applied' : 'Mark as Applied'}
              className={`px-2 py-1 border transition-all text-[11px] flex items-center gap-1 ${
                isApplied
                  ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-bold'
                  : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted hover:border-ink dark:hover:border-ink-dark'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              <span>{isApplied ? 'APPLIED' : 'APPLY'}</span>
            </button>

            {/* Hide Job */}
            <button
              onClick={() => onSetStatus('hidden')}
              title="Hide Job Listing"
              className="p-1 border border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted hover:text-signal transition-colors"
            >
              <EyeOff className="w-3 h-3" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
