import React from 'react';
import { Building2, X, CheckCircle2, Globe, ExternalLink } from 'lucide-react';
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

  // Compute job count per company
  const companyJobCounts = jobs.reduce((acc, job) => {
    const cName = job.company.toLowerCase();
    acc[cName] = (acc[cName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-slide-down">
      <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Company ATS Watchlist</h2>
              <p className="text-xs text-slate-400">Tracked ATS boards polled continuously every 90 seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watchlist Table / Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          {DEFAULT_WATCHLIST.map((comp) => {
            const count = companyJobCounts[comp.name.toLowerCase()] || 0;
            return (
              <div
                key={comp.ats_slug}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-indigo-300 border border-slate-700">
                    {comp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{comp.name}</h4>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize font-medium text-indigo-300">{comp.ats_type}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-500">slug: {comp.ats_slug}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-white block">{count}</span>
                  <span className="text-[11px] text-slate-500">live jobs discovered</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Polling 6 high-growth tech companies</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Close Watchlist
          </button>
        </div>

      </div>
    </div>
  );
};
