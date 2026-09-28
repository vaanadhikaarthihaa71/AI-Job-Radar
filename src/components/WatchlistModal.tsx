import React from 'react';
import { Building2, X, CheckCircle2 } from 'lucide-react';
import { Job } from '../types/job';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
}

interface WatchlistCompany {
  name: string;
  ats_type: string;
  ats_slug: string;
  active: boolean;
}

const DEFAULT_WATCHLIST: WatchlistCompany[] = [
  { name: 'Stripe', ats_type: 'greenhouse', ats_slug: 'stripe', active: true },
  { name: 'Cloudflare', ats_type: 'greenhouse', ats_slug: 'cloudflare', active: true },
  { name: 'Figma', ats_type: 'lever', ats_slug: 'figma', active: true },
  { name: 'Spotify', ats_type: 'lever', ats_slug: 'spotify', active: true },
  { name: 'Linear', ats_type: 'ashby', ats_slug: 'linear', active: true },
  { name: 'OpenAI', ats_type: 'ashby', ats_slug: 'openai', active: true },
];

export const WatchlistModal: React.FC<WatchlistModalProps> = ({ isOpen, onClose, jobs }) => {
  if (!isOpen) return null;

  const companyJobCounts = jobs.reduce((acc, job) => {
    const cName = job.company.toLowerCase();
    acc[cName] = (acc[cName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 dark:bg-black/80 flex items-center justify-center p-4 animate-ledger-enter">
      <div className="w-full max-w-2xl bg-paper dark:bg-paper-dark border-2 border-ink dark:border-ink-dark shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line dark:border-line-dark">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-signal" />
            <div>
              <h2 className="text-base font-serif font-bold text-ink dark:text-ink-dark">Company Watchlist Directory</h2>
              <p className="text-xs text-ink-muted dark:text-ink-dark-muted">Tracked ATS boards polled every 90 seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watchlist Table */}
        <div className="p-6 overflow-y-auto space-y-3">
          {DEFAULT_WATCHLIST.map((comp) => {
            const count = companyJobCounts[comp.name.toLowerCase()] || 0;
            return (
              <div
                key={comp.ats_slug}
                className="flex items-center justify-between p-4 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle hover:border-ink dark:hover:border-ink-dark transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-ink dark:text-ink-dark">{comp.name}</h4>
                    <span className="text-[10px] text-signal font-bold uppercase border border-signal px-1.5 py-0.5">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted dark:text-ink-dark-muted">
                    ATS: <span className="uppercase text-ink dark:text-ink-dark font-semibold">{comp.ats_type}</span> • SLUG: {comp.ats_slug}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-signal block">{count}</span>
                  <span className="text-[10px] text-ink-muted dark:text-ink-dark-muted uppercase">RECORDED JOBS</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-paper-subtle dark:bg-paper-dark-subtle border-t border-line dark:border-line-dark flex items-center justify-between text-xs">
          <span className="text-ink-muted dark:text-ink-dark-muted uppercase">6 ACTIVE DIRECTORIES MONITORED</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-semibold uppercase text-xs hover:opacity-90 transition-opacity"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
