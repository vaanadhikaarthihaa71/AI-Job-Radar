import React from 'react';
import { ExternalLink, MapPin, Globe, Building2, Tag, Clock } from 'lucide-react';
import { Job } from '../types/job';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
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

  // Score color helper
  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (score >= 50) return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300';
    return 'bg-slate-800 border-slate-700 text-slate-400';
  };

  return (
    <div
      className={`glass-panel glass-panel-hover rounded-xl p-5 mb-3.5 transition-all duration-300 relative overflow-hidden ${
        job.isNew ? 'new-job-highlight' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        
        {/* Main Content */}
        <div className="space-y-2.5 flex-1 min-w-0">
          
          {/* Header Row: Title & Company */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-semibold text-white tracking-tight hover:text-indigo-300 transition-colors">
                <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                  <span className="truncate">{job.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0 inline" />
                </a>
              </h3>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {job.company}
              </span>

              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {job.location}
                </span>
              )}

              {job.is_remote && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium text-[11px]">
                  <Globe className="w-3 h-3 text-purple-400" />
                  Remote
                </span>
              )}

              {job.source && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-slate-400 text-[11px] capitalize">
                  {job.source}
                </span>
              )}
            </div>
          </div>

          {/* Detection Delay Badge (Mono Type) */}
          {delayText && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono pt-0.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800/80 text-indigo-300 font-semibold text-[11px]">
                {delayText}
              </span>
            </div>
          )}

          {/* Matched Skills Badges */}
          {job.matched_skills && job.matched_skills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Tag className="w-3 h-3 text-slate-500 mr-0.5" />
              {job.matched_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/50 text-indigo-200 text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* Score Badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs ${getScoreBadgeClass(
              job.score
            )}`}
          >
            <span>Match {job.score}/100</span>
          </div>

          {job.seniority && (
            <span className="text-[11px] text-slate-400 font-medium">
              {job.seniority}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
