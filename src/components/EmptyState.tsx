import React from 'react';
import { RotateCcw, AlertTriangle, Database, Search, Bookmark, CheckCircle, EyeOff, Building2 } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'saved' | 'applied' | 'hidden' | 'watchlist';
  nextScanInSeconds?: number;
  onResetSearch?: () => void;
  errorMessage?: string | null;
  totalDbJobsCount?: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onResetSearch,
  errorMessage,
  totalDbJobsCount,
}) => {
  if (errorMessage) {
    return (
      <div className="py-16 px-6 border border-line dark:border-line-dark rounded-sm text-center my-8 bg-paper-subtle/50 dark:bg-paper-dark-subtle/50 font-sans">
        <div className="w-10 h-10 rounded-full bg-signal/10 text-signal mx-auto flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-serif font-bold text-ink dark:text-ink-dark mb-1">
          Connection issue
        </h3>
        <p className="text-xs text-ink-muted dark:text-ink-dark-muted max-w-md mx-auto mb-6">
          {errorMessage}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-signal text-white text-xs font-semibold rounded-sm hover:bg-signal/90 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (totalDbJobsCount === 0 && type === 'search') {
    return (
      <div className="py-16 px-6 border border-line dark:border-line-dark rounded-sm text-center my-8 bg-paper-subtle/50 dark:bg-paper-dark-subtle/50 font-sans">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center mb-3">
          <Database className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-serif font-bold text-ink dark:text-ink-dark mb-1">
          No opportunities currently monitored
        </h3>
        <p className="text-xs text-ink-muted dark:text-ink-dark-muted max-w-md mx-auto mb-4">
          The database currently has zero recorded positions. Run <code className="font-mono bg-paper dark:bg-paper-dark px-1.5 py-0.5 border border-line dark:border-line-dark">python load_real_jobs.py</code> to populate jobs.
        </p>
      </div>
    );
  }

  const configs = {
    search: {
      icon: Search,
      title: 'No matching opportunities',
      description: 'Try broadening your filters or clearing search keywords to discover more roles.',
      action: onResetSearch ? (
        <button
          onClick={onResetSearch}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark text-xs font-semibold rounded-sm hover:bg-signal dark:hover:bg-signal transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      ) : null,
    },
    saved: {
      icon: Bookmark,
      title: 'No saved jobs',
      description: "Save opportunities you're interested in and they'll appear here.",
      action: null,
    },
    applied: {
      icon: CheckCircle,
      title: 'No applications',
      description: 'Once you apply to an opportunity, track it here.',
      action: null,
    },
    hidden: {
      icon: EyeOff,
      title: 'No hidden jobs',
      description: 'Jobs you hide will be safely stored here.',
      action: null,
    },
    watchlist: {
      icon: Building2,
      title: 'No watchlisted companies',
      description: 'Add company domains to track their direct career board postings.',
      action: null,
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="py-16 px-6 border border-line dark:border-line-dark rounded-sm text-center my-8 bg-paper-subtle/40 dark:bg-paper-dark-subtle/40 font-sans">
      <div className="w-10 h-10 rounded-full bg-paper-subtle dark:bg-paper-dark-subtle text-ink-muted dark:text-ink-dark-muted mx-auto flex items-center justify-center mb-3 border border-line dark:border-line-dark">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-serif font-bold text-ink dark:text-ink-dark mb-1">
        {config.title}
      </h3>
      <p className="text-xs text-ink-muted dark:text-ink-dark-muted max-w-sm mx-auto mb-6">
        {config.description}
      </p>
      {config.action}
    </div>
  );
};
