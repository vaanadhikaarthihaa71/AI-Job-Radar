import React from 'react';
import { RotateCcw, Clock } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'saved' | 'applied' | 'hidden' | 'watchlist';
  nextScanInSeconds?: number;
  onResetSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  nextScanInSeconds = 90,
  onResetSearch,
}) => {
  const configs = {
    search: {
      code: 'ERR_EMPTY_SEARCH',
      title: 'No Job Postings Matched Your Query',
      description: `The search filters yielded zero results in the current stream. Next automatic background scan runs in ${nextScanInSeconds}s (ATS poller runs every 90s, JobSpy runs every 12m).`,
      action: onResetSearch ? (
        <button
          onClick={onResetSearch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark text-xs font-mono font-semibold uppercase tracking-wider transition-opacity hover:opacity-90"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      ) : null,
    },
    saved: {
      code: 'ERR_NO_SAVED_ITEMS',
      title: 'No Saved Bookmarks in Ledger',
      description: 'You have not saved any job postings yet. Press "S" on any listing or click SAVE to bookmark jobs for later review.',
      action: null,
    },
    applied: {
      code: 'ERR_NO_APPLICATIONS',
      title: 'No Applied Records Tracked',
      description: 'No applications have been logged. Click APPLY on any ledger listing after submitting your application.',
      action: null,
    },
    hidden: {
      code: 'ERR_NO_HIDDEN_ITEMS',
      title: 'No Hidden Listings',
      description: 'You have not hidden any jobs. Hiding unwanted postings removes them from your live stream view.',
      action: null,
    },
    watchlist: {
      code: 'ERR_WATCHLIST_EMPTY',
      title: 'Watchlist Directory Empty',
      description: 'No company boards are configured in the active tracking list.',
      action: null,
    },
  };

  const config = configs[type];

  return (
    <div className="py-16 px-6 border border-dashed border-line dark:border-line-dark text-center my-8 transition-colors duration-200">
      <div className="text-[10px] font-mono text-signal font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
        <Clock className="w-3 h-3" />
        <span>[{config.code}]</span>
      </div>
      <h3 className="text-lg font-serif font-bold text-ink dark:text-ink-dark mb-2">
        {config.title}
      </h3>
      <p className="text-xs font-mono text-ink-muted dark:text-ink-dark-muted max-w-md mx-auto mb-6 leading-relaxed">
        {config.description}
      </p>
      {config.action}
    </div>
  );
};
