import React from 'react';
import { ConnectionState, DashboardStats } from '../types/job';
import { Sun, Moon, Pause, Play } from 'lucide-react';

interface HeaderProps {
  connectionState: ConnectionState;
  stats: DashboardStats;
  isPaused: boolean;
  onTogglePause: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  stats,
  isPaused,
  onTogglePause,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="border-b border-line dark:border-line-dark bg-paper dark:bg-paper-dark transition-colors duration-200">
      
      {/* Top Utility Bar & Stat Strip */}
      <div className="border-b border-line dark:border-line-dark px-4 lg:px-8 py-2 text-[11px] font-mono tracking-wider text-ink-muted dark:text-ink-dark-muted uppercase">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Live Status & Pulse Dot */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              {connectionState === 'connected' && (
                <>
                  <span className="animate-signal-pulse absolute inline-flex h-full w-full rounded-full bg-signal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-signal"></span>
                </>
              )}
              {connectionState === 'reconnecting' && (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
              {connectionState === 'disconnected' && (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-400"></span>
              )}
            </span>
            <span className="font-semibold text-ink dark:text-ink-dark">
              {connectionState === 'connected' ? 'LIVE STREAM ACTIVE' : connectionState.toUpperCase()}
            </span>
            <span className="text-line dark:text-line-dark">|</span>
            <span>UPDATED 2 MIN AGO</span>
          </div>

          {/* Compact Stat Strip */}
          <div className="flex items-center gap-4 flex-wrap">
            <div>NEW TODAY: <strong className="text-ink dark:text-ink-dark font-bold">{stats.jobsLastHour}</strong></div>
            <span className="text-line dark:text-line-dark">•</span>
            <div>ACTIVE LISTINGS: <strong className="text-ink dark:text-ink-dark font-bold">{stats.totalActiveJobs}</strong></div>
            <span className="text-line dark:text-line-dark">•</span>
            <div>
              MEDIAN DELAY:{' '}
              <strong className="text-signal font-bold">
                {stats.medianDelayMinutes !== null ? `${stats.medianDelayMinutes}m` : 'N/A'}
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* Main Newspaper Masthead & Controls */}
      <div className="px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          
          {/* Editorial Masthead Title */}
          <div>
            <div className="text-[10px] font-mono tracking-widest text-ink-muted dark:text-ink-dark-muted uppercase mb-1">
              Vol. I — Live Intelligence Feed
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-ink dark:text-ink-dark tracking-tight">
              Job Radar Briefing
            </h1>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted font-sans mt-1 max-w-lg">
              Automated scraping ledger tracking tech roles across LinkedIn, Indeed, Glassdoor, Greenhouse, Lever, and Ashby.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            
            {/* Pause Live Updates Button */}
            <button
              onClick={onTogglePause}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-none border text-xs font-mono font-medium transition-all ${
                isPaused
                  ? 'bg-signal/10 border-signal text-signal'
                  : 'bg-paper-subtle dark:bg-paper-dark-subtle border-line dark:border-line-dark text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'RESUME STREAM' : 'PAUSE UPDATES'}</span>
            </button>

            {/* Disciplined Light / Dark Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark transition-all text-xs font-mono flex items-center gap-1.5"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="uppercase text-[10px]">{theme}</span>
            </button>

          </div>

        </div>
      </div>

    </header>
  );
};
