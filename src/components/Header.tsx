import React, { useState, useRef, useEffect } from 'react';
import { ConnectionState, DashboardStats, UserProfile } from '../types/job';
import {
  Sun,
  Moon,
  Pause,
  Play,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  LogOut,
  ChevronDown,
  Search,
  Building2,
  SlidersHorizontal,
  Bookmark,
  Activity,
  Briefcase,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'opportunities' | 'saved' | 'applications' | 'intelligence';

interface HeaderProps {
  connectionState: ConnectionState;
  stats: DashboardStats;
  isPaused: boolean;
  onTogglePause: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userProfile?: UserProfile | null;
  onOpenOnboarding?: () => void;
  onOpenChat?: () => void;
  errorMessage?: string | null;
  nextScanInSeconds?: number;
  activeNavTab: NavTab;
  onNavTabChange: (tab: NavTab) => void;
  onOpenCommandPalette: () => void;
  onOpenWatchlist: () => void;
  onOpenSavedSearches: () => void;
  savedCount: number;
  appliedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  stats,
  isPaused,
  onTogglePause,
  theme,
  onToggleTheme,
  userProfile,
  onOpenOnboarding,
  onOpenChat,
  errorMessage,
  nextScanInSeconds = 83,
  activeNavTab,
  onNavTabChange,
  onOpenCommandPalette,
  onOpenWatchlist,
  onOpenSavedSearches,
  savedCount,
  appliedCount,
}) => {
  const { user, loading, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email?.split('@')[0] || userProfile?.name || 'Vaanadhi';

  return (
    <header className="sticky top-0 z-30 border-b border-line dark:border-line-dark bg-paper/95 dark:bg-paper-dark/95 backdrop-blur-md transition-colors duration-200">
      
      {/* Reassuring Intelligence Live Status Bar */}
      <div className="border-b border-line/60 dark:border-line-dark/60 px-4 lg:px-8 py-1.5 text-[11px] font-mono text-ink-muted dark:text-ink-dark-muted">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Reassuring intelligence status */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {connectionState === 'connected' && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </>
              )}
              {connectionState === 'reconnecting' && (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
              {connectionState === 'disconnected' && (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-400"></span>
              )}
            </span>
            <span className="font-medium text-ink dark:text-ink-dark flex items-center gap-1.5">
              <span>● Live monitoring</span>
            </span>
            <span className="text-line dark:text-line-dark">·</span>
            <span>Last synchronized 2 min ago</span>
            <span className="text-line dark:text-line-dark hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              <strong className="text-ink dark:text-ink-dark font-semibold">{stats.totalActiveJobs.toLocaleString()}</strong> opportunities monitored
            </span>
          </div>

          {/* Right: Next Scan & Pause Button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-ink-muted dark:text-ink-dark-muted">Next update in</span>
              <span className="font-bold text-signal font-mono">{nextScanInSeconds}s</span>
            </div>
            <button
              onClick={onTogglePause}
              className="hover:text-ink dark:hover:text-ink-dark text-ink-muted dark:text-ink-dark-muted flex items-center gap-1 transition-colors"
              title={isPaused ? 'Resume updates' : 'Pause updates'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3 h-3 text-signal" />
                  <span className="text-signal font-medium">Resumed</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Fetch Error Banner */}
      {errorMessage && (
        <div className="bg-signal text-white px-4 lg:px-8 py-1.5 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 font-bold underline hover:opacity-80"
          >
            <RefreshCw className="w-3 h-3" />
            <span>RETRY NOW</span>
          </button>
        </div>
      )}

      {/* Main Global Navigation */}
      <div className="px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* LEFT: JOB RADAR Wordmark */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => onNavTabChange('opportunities')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-7 h-7 bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-bold font-serif text-sm flex items-center justify-center rounded-sm tracking-tighter group-hover:bg-signal transition-colors">
                JR
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-ink dark:text-ink-dark leading-none group-hover:text-signal transition-colors">
                  JOB RADAR
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase text-ink-muted dark:text-ink-dark-muted leading-tight mt-0.5">
                  Career Intelligence
                </span>
              </div>
            </button>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-sans text-xs font-medium">
            <button
              onClick={() => onNavTabChange('opportunities')}
              className={`px-3.5 py-1.5 rounded-sm transition-colors flex items-center gap-2 ${
                activeNavTab === 'opportunities'
                  ? 'bg-ink/5 dark:bg-ink-dark/10 text-ink dark:text-ink-dark font-semibold border-b-2 border-signal'
                  : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-ink/5 dark:hover:bg-ink-dark/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Opportunities</span>
            </button>

            <button
              onClick={() => onNavTabChange('saved')}
              className={`px-3.5 py-1.5 rounded-sm transition-colors flex items-center gap-2 ${
                activeNavTab === 'saved'
                  ? 'bg-ink/5 dark:bg-ink-dark/10 text-ink dark:text-ink-dark font-semibold border-b-2 border-signal'
                  : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-ink/5 dark:hover:bg-ink-dark/5'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-signal" />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-signal/10 text-signal font-semibold rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavTabChange('applications')}
              className={`px-3.5 py-1.5 rounded-sm transition-colors flex items-center gap-2 ${
                activeNavTab === 'applications'
                  ? 'bg-ink/5 dark:bg-ink-dark/10 text-ink dark:text-ink-dark font-semibold border-b-2 border-signal'
                  : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-ink/5 dark:hover:bg-ink-dark/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Applications</span>
              {appliedCount > 0 && (
                <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-ink/10 dark:bg-ink-dark/10 text-ink dark:text-ink-dark font-semibold rounded-full">
                  {appliedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavTabChange('intelligence')}
              className={`px-3.5 py-1.5 rounded-sm transition-colors flex items-center gap-2 ${
                activeNavTab === 'intelligence'
                  ? 'bg-ink/5 dark:bg-ink-dark/10 text-ink dark:text-ink-dark font-semibold border-b-2 border-signal'
                  : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-ink/5 dark:hover:bg-ink-dark/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Intelligence</span>
            </button>
          </nav>

          {/* RIGHT: Action Triggers & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Search Shortcut button */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-2.5 py-1.5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark text-xs font-mono rounded-sm transition-colors"
              title="Search jobs (⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="text-[10px] px-1 py-0.2 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark rounded">
                ⌘K
              </kbd>
            </button>



            {/* Watchlist Quick Link */}
            <button
              onClick={onOpenWatchlist}
              className="p-2 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
              title="Company Watchlist"
            >
              <Building2 className="w-4 h-4" />
            </button>

            {/* Saved Searches Quick Link */}
            <button
              onClick={onOpenSavedSearches}
              className="p-2 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark transition-colors hidden sm:block"
              title="Saved Searches"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* User Profile / Auth */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark animate-pulse"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-sm text-xs transition-colors hover:bg-ink/5 dark:hover:bg-ink-dark/5"
                >
                  <div className="w-7 h-7 rounded-full bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-bold font-sans flex items-center justify-center text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted dark:text-ink-dark-muted" />
                </button>

                {/* Profile Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark shadow-xl z-50 text-xs animate-fade-in py-1">
                    <div className="px-3 py-2 border-b border-line dark:border-line-dark space-y-0.5">
                      <div className="font-semibold text-ink dark:text-ink-dark">{displayName}</div>
                      <div className="text-[11px] text-ink-muted dark:text-ink-dark-muted truncate font-mono">
                        {user.email}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavTabChange('saved');
                        }}
                        className="w-full text-left px-3 py-2 text-ink dark:text-ink-dark hover:bg-paper-subtle dark:hover:bg-paper-dark-subtle flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Bookmark className="w-3.5 h-3.5 text-signal" />
                          <span>Saved Opportunities</span>
                        </span>
                        <span className="font-mono text-[10px] text-ink-muted dark:text-ink-dark-muted">
                          {savedCount}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavTabChange('applications');
                        }}
                        className="w-full text-left px-3 py-2 text-ink dark:text-ink-dark hover:bg-paper-subtle dark:hover:bg-paper-dark-subtle flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Applications Tracker</span>
                        </span>
                        <span className="font-mono text-[10px] text-ink-muted dark:text-ink-dark-muted">
                          {appliedCount}
                        </span>
                      </button>

                      {onOpenOnboarding && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenOnboarding();
                          }}
                          className="w-full text-left px-3 py-2 text-ink dark:text-ink-dark hover:bg-paper-subtle dark:hover:bg-paper-dark-subtle flex items-center gap-2 transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted dark:text-ink-dark-muted" />
                          <span>Career Focus & Preferences</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                          window.location.href = '/';
                        }}
                        className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-line dark:border-line-dark mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenOnboarding}
                className="px-3 py-1.5 bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark hover:bg-signal dark:hover:bg-signal transition-colors text-xs font-medium rounded-sm"
              >
                Sign In
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around border-t border-line dark:border-line-dark pt-2.5 mt-2 font-sans text-xs">
          <button
            onClick={() => onNavTabChange('opportunities')}
            className={`py-1 px-2 font-medium border-b-2 ${
              activeNavTab === 'opportunities'
                ? 'border-signal text-ink dark:text-ink-dark font-semibold'
                : 'border-transparent text-ink-muted dark:text-ink-dark-muted'
            }`}
          >
            Opportunities
          </button>

          <button
            onClick={() => onNavTabChange('saved')}
            className={`py-1 px-2 font-medium border-b-2 ${
              activeNavTab === 'saved'
                ? 'border-signal text-ink dark:text-ink-dark font-semibold'
                : 'border-transparent text-ink-muted dark:text-ink-dark-muted'
            }`}
          >
            Saved ({savedCount})
          </button>

          <button
            onClick={() => onNavTabChange('applications')}
            className={`py-1 px-2 font-medium border-b-2 ${
              activeNavTab === 'applications'
                ? 'border-signal text-ink dark:text-ink-dark font-semibold'
                : 'border-transparent text-ink-muted dark:text-ink-dark-muted'
            }`}
          >
            Applications ({appliedCount})
          </button>

          <button
            onClick={() => onNavTabChange('intelligence')}
            className={`py-1 px-2 font-medium border-b-2 ${
              activeNavTab === 'intelligence'
                ? 'border-signal text-ink dark:text-ink-dark font-semibold'
                : 'border-transparent text-ink-muted dark:text-ink-dark-muted'
            }`}
          >
            Intelligence
          </button>
        </div>

      </div>

    </header>
  );
};
