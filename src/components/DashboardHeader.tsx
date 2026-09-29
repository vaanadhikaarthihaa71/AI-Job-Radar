import React from 'react';
import { UserProfile } from '../types/job';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardHeaderProps {
  userProfile: UserProfile | null;
  totalMatchCount: number;
  newTodayCount: number;
  highMatchCount: number;
  remoteCount: number;
  onOpenPreferences: () => void;
  onOpenChat: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userProfile,
  totalMatchCount,
  newTodayCount,
  highMatchCount,
  remoteCount,
  onOpenPreferences,
  onOpenChat,
}) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const rawName = user?.name || user?.email?.split('@')[0] || userProfile?.name || 'Vaanadhi';
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <div className="py-6 border-b border-line dark:border-line-dark mb-6 space-y-6">
      
      {/* Top Editorial Greeting Heading (DM Serif Display) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-ink dark:text-ink-dark tracking-tight">
            {getGreeting()}, {name}.
          </h1>
          <p className="text-sm font-sans text-ink-muted dark:text-ink-dark-muted mt-2 flex items-center gap-2">
            <span className="font-semibold text-ink dark:text-ink-dark font-mono text-xs px-2 py-0.5 bg-paper-surface dark:bg-paper-dark-surface border border-line dark:border-line-dark rounded-sm">
              {totalMatchCount} opportunities
            </span>
            <span>match your career profile.</span>
          </p>
        </div>

        {/* Career Focus Action Trigger */}
        <div className="flex items-center gap-2 font-sans text-xs">
          <button
            onClick={onOpenPreferences}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-line dark:border-line-dark bg-paper-surface dark:bg-paper-dark-surface hover:border-ink dark:hover:border-ink-dark text-ink dark:text-ink-dark font-medium rounded-sm transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted dark:text-ink-dark-muted" />
            <span>Career Focus</span>
          </button>
        </div>
      </div>

      {/* Compact Data Blocks (IBM Plex Mono labels & values) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        
        {/* OPPORTUNITIES */}
        <div className="p-4 bg-paper-surface dark:bg-paper-dark-surface border border-line dark:border-line-dark rounded-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
            OPPORTUNITIES
          </div>
          <div className="text-2xl font-bold text-ink dark:text-ink-dark mt-1">
            {totalMatchCount}
          </div>
        </div>

        {/* NEW TODAY */}
        <div className="p-4 bg-paper-surface dark:bg-paper-dark-surface border border-line dark:border-line-dark rounded-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted flex items-center justify-between">
            <span>NEW TODAY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
          </div>
          <div className="text-2xl font-bold text-signal mt-1">
            {newTodayCount}
          </div>
        </div>

        {/* HIGH MATCH */}
        <div className="p-4 bg-paper-surface dark:bg-paper-dark-surface border border-line dark:border-line-dark rounded-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
            HIGH MATCH
          </div>
          <div className="text-2xl font-bold text-state-success mt-1">
            {highMatchCount}
          </div>
        </div>

        {/* REMOTE */}
        <div className="p-4 bg-paper-surface dark:bg-paper-dark-surface border border-line dark:border-line-dark rounded-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
            REMOTE
          </div>
          <div className="text-2xl font-bold text-ink dark:text-ink-dark mt-1">
            {remoteCount}
          </div>
        </div>

      </div>

    </div>
  );
};
