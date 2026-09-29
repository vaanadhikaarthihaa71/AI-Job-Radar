import React, { useState } from 'react';
import {
  ExternalLink,
  X,
  CheckCircle,
  Star,
  Globe,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Check,
  Bookmark,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Job } from '../types/job';
import { JobStatus } from '../hooks/useJobStatus';
import { formatDistanceToNow } from 'date-fns';

interface JobApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  status: JobStatus;
  onClose: () => void;
  onSetStatus: (status: JobStatus) => void;
  onToggleSave: () => void;
}

export const JobApplyModal: React.FC<JobApplyModalProps> = ({
  job,
  isOpen,
  status,
  onClose,
  onSetStatus,
  onToggleSave,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'website'>('details');
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!isOpen || !job) return null;

  const isSaved = status === 'saved';
  const isApplied = status === 'applied';

  const handleApplyAction = () => {
    if (!isApplied) {
      onSetStatus('applied');
    }
    window.open(job.job_url, '_blank', 'noopener,noreferrer');
  };

  // Generate Match Breakdown details
  const getMatchBreakdown = () => {
    const matched: string[] = [];
    const gaps: string[] = [];

    if (job.matched_skills && job.matched_skills.length > 0) {
      job.matched_skills.forEach((skill) => matched.push(skill));
    } else {
      matched.push('Core role alignment');
    }

    if (job.is_remote) {
      matched.push('Remote preference matched');
    }

    if (job.industry) {
      matched.push(`${job.industry} domain matched`);
    }

    if (job.location && (job.location.toLowerCase().includes('india') || job.location.toLowerCase().includes('bengaluru'))) {
      matched.push('Location preference (India)');
    }

    // Potential gaps derived from standard profile checks
    if (!job.matched_skills?.includes('AWS') && !job.matched_skills?.includes('Cloud')) {
      gaps.push('AWS / Cloud infrastructure experience preferred');
    }
    if (!job.salary) {
      gaps.push('Salary range unlisted in source payload');
    }

    return { matched, gaps };
  };

  const { matched, gaps } = getMatchBreakdown();

  const getRelativeTime = (): string => {
    const rawDate = job.posted_at || job.detected_at;
    if (!rawDate) return 'Recently posted';
    try {
      const dateObj = new Date(rawDate);
      if (isNaN(dateObj.getTime())) return 'Recently posted';
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return 'Recently posted';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 dark:bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Right-Side Detail Drawer */}
      <div className="relative w-full max-w-2xl bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark border-l border-line dark:border-line-dark shadow-2xl flex flex-col h-full z-10 animate-slide-in-right font-sans">
        
        {/* Top Header Controls */}
        <div className="border-b border-line dark:border-line-dark px-6 py-4 flex items-center justify-between bg-paper-subtle dark:bg-paper-dark-subtle shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase text-ink-muted dark:text-ink-dark-muted">
              Opportunity Detail
            </span>
            <span className="text-line dark:text-line-dark">·</span>
            <span className="text-xs font-mono text-signal font-bold uppercase">{job.source}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark rounded-sm transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Title & Key Specs */}
          <div className="space-y-3">
            <h2 className="text-2xl font-sans font-bold text-ink dark:text-ink-dark tracking-tight leading-tight">
              {job.title}
            </h2>

            <div className="flex items-center gap-2 text-sm text-ink-muted dark:text-ink-dark-muted flex-wrap">
              <span className="font-semibold text-ink dark:text-ink-dark">{job.company}</span>
              <span>·</span>
              <span>{job.location || 'Multiple Locations'}</span>
              <span>·</span>
              {job.is_remote ? (
                <span className="text-signal font-medium">Remote</span>
              ) : (
                <span>On-site</span>
              )}
              <span>·</span>
              <span className="font-mono text-xs">{getRelativeTime()}</span>
            </div>

            {job.salary && (
              <div className="inline-block px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold rounded-sm">
                {job.salary}
              </div>
            )}
          </div>

          {/* Match Score UX Block */}
          <div className="p-4 border border-line dark:border-line-dark bg-paper-subtle/60 dark:bg-paper-dark-subtle/60 rounded-sm space-y-4">
            
            {/* Header Score Line */}
            <div className="flex items-center justify-between pb-3 border-b border-line dark:border-line-dark">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
                  INTELLIGENCE RELEVANCY
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-serif font-bold text-ink dark:text-ink-dark">
                    {job.score}
                  </span>
                  <span className="text-xs font-mono uppercase font-bold text-signal">
                    % MATCH
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-semibold px-2 py-1 bg-signal/10 text-signal border border-signal/30 rounded-sm">
                  {job.score >= 80 ? 'High Skill Alignment' : 'Moderate Alignment'}
                </span>
              </div>
            </div>

            {/* Why this matches you */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase font-bold text-ink dark:text-ink-dark flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Why this matches you</span>
              </h4>
              <div className="space-y-1 pl-5 text-xs text-ink/90 dark:text-ink-dark/90">
                {matched.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential Gaps */}
            {gaps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-line/50 dark:border-line-dark/50">
                <h4 className="text-xs font-mono uppercase font-bold text-ink-muted dark:text-ink-dark-muted flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Potential gaps</span>
                </h4>
                <div className="space-y-1 pl-5 text-xs text-ink-muted dark:text-ink-dark-muted">
                  {gaps.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Skill Tags */}
          {job.matched_skills && job.matched_skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase font-bold text-ink-muted dark:text-ink-dark-muted">
                REQUIRED & MATCHED SKILLS
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.matched_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark text-ink dark:text-ink-dark text-xs font-mono rounded-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description & Requirements */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-mono uppercase font-bold text-ink-muted dark:text-ink-dark-muted">
              JOB DESCRIPTION & REQUIREMENTS
            </h4>
            <div
              className="text-xs text-ink/90 dark:text-ink-dark/90 leading-relaxed space-y-2 font-sans border-t border-line dark:border-line-dark pt-3 max-h-80 overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: job.description || '<p>No explicit job description provided in source payload.</p>',
              }}
            />
          </div>

          {/* Optional Embedded Frame Switcher */}
          <div className="pt-2 border-t border-line dark:border-line-dark">
            <button
              onClick={() => setActiveTab(activeTab === 'details' ? 'website' : 'details')}
              className="text-xs font-mono text-signal hover:underline flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{activeTab === 'details' ? 'Preview Live Website Frame' : 'Return to Structured Specification'}</span>
            </button>
          </div>

          {activeTab === 'website' && (
            <div className="w-full h-96 border border-line dark:border-line-dark rounded-sm overflow-hidden relative">
              <iframe
                src={job.job_url}
                title={job.title}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </div>
          )}

        </div>

        {/* Bottom Application Action Strip */}
        <div className="border-t border-line dark:border-line-dark px-6 py-4 bg-paper-subtle dark:bg-paper-dark-subtle flex items-center justify-between gap-3 shrink-0">
          
          {/* Save Button */}
          <button
            onClick={onToggleSave}
            className={`px-3 py-2 border text-xs font-sans font-medium rounded-sm transition-colors flex items-center gap-1.5 ${
              isSaved
                ? 'bg-signal/10 border-signal text-signal font-semibold'
                : 'border-line dark:border-line-dark text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-signal text-signal' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border border-line dark:border-line-dark text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark text-xs font-sans font-medium rounded-sm transition-colors flex items-center gap-1"
            >
              <span>Open original listing</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleApplyAction}
              className="px-4 py-2 bg-signal text-white font-sans font-semibold text-xs rounded-sm hover:bg-signal/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
