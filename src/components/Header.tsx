import React from 'react';
import { Radio, Pause, Play, Clock, Zap, Activity } from 'lucide-react';
import { ConnectionState, DashboardStats } from '../types/job';

interface HeaderProps {
  connectionState: ConnectionState;
  stats: DashboardStats;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  stats,
  isPaused,
  onTogglePause,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Connection Status */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                JOB RADAR
              </h1>
              <p className="text-xs text-slate-400 font-medium">Live Stream Dashboard</p>
            </div>
          </div>

          {/* Connection Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium">
            <span className="relative flex h-2.5 w-2.5">
              {connectionState === 'connected' && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              )}
              {connectionState === 'reconnecting' && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </>
              )}
              {connectionState === 'disconnected' && (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              )}
            </span>
            <span className="capitalize text-slate-200">
              {connectionState === 'connected' ? 'Connected' : connectionState}
            </span>
          </div>
        </div>

        {/* Real-time Dashboard Metrics */}
        <div className="flex items-center gap-3 md:gap-6 text-xs text-slate-300 w-full md:w-auto justify-between md:justify-end">
          
          {/* Jobs Found in Last Hour */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <Activity className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Last Hour</span>
              <span className="font-semibold text-slate-100">{stats.jobsLastHour} jobs</span>
            </div>
          </div>

          {/* Median Detection Delay */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <Clock className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Median Delay</span>
              <span className="font-mono font-semibold text-purple-300">
                {stats.medianDelayMinutes !== null ? `${stats.medianDelayMinutes} min` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Pause Live Updates Toggle Button */}
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs transition-all duration-200 border ${
              isPaused
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700/80 hover:border-slate-600'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Resume Live Stream</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span>Pause Live Updates</span>
              </>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
