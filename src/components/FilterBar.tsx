import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp, Star, CheckCircle, EyeOff, Building2, Bookmark } from 'lucide-react';

export type MainTab = 'all' | 'saved' | 'applied' | 'hidden';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSource: string;
  onSourceChange: (s: string) => void;
  remoteOnly: boolean;
  onRemoteOnlyChange: (r: boolean) => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenWatchlist: () => void;
  onOpenSavedSearches: () => void;
  onOpenCommandPalette: () => void;
  onReset: () => void;
  totalFilteredCount: number;
  statusCounts: {
    all: number;
    saved: number;
    applied: number;
    hidden: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSource,
  onSourceChange,
  remoteOnly,
  onRemoteOnlyChange,
  minScore,
  onMinScoreChange,
  activeTab,
  onTabChange,
  onOpenWatchlist,
  onOpenSavedSearches,
  onOpenCommandPalette,
  onReset,
  totalFilteredCount,
  statusCounts,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="border-b-2 border-ink dark:border-ink-dark pb-4 mb-6 space-y-4 transition-colors duration-200">
      
      {/* Top Status Tabs Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-line dark:border-line-dark pb-3">
        
        {/* Status Navigation Tabs */}
        <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3 py-1.5 border font-semibold uppercase transition-all ${
              activeTab === 'all'
                ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark border-ink dark:border-ink-dark'
                : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted hover:border-ink dark:hover:border-ink-dark'
            }`}
          >
            ALL STREAM ({statusCounts.all})
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`px-3 py-1.5 border font-semibold uppercase transition-all flex items-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-signal text-white border-signal'
                : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted hover:border-ink dark:hover:border-ink-dark'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>SAVED ({statusCounts.saved})</span>
          </button>

          <button
            onClick={() => onTabChange('applied')}
            className={`px-3 py-1.5 border font-semibold uppercase transition-all flex items-center gap-1 ${
              activeTab === 'applied'
                ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark border-ink dark:border-ink-dark'
                : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted hover:border-ink dark:hover:border-ink-dark'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>APPLIED ({statusCounts.applied})</span>
          </button>

          <button
            onClick={() => onTabChange('hidden')}
            className={`px-3 py-1.5 border font-semibold uppercase transition-all flex items-center gap-1 ${
              activeTab === 'hidden'
                ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark border-ink dark:border-ink-dark'
                : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted hover:border-ink dark:hover:border-ink-dark'
            }`}
          >
            <EyeOff className="w-3 h-3" />
            <span>HIDDEN ({statusCounts.hidden})</span>
          </button>
        </div>

        {/* Modal Triggers */}
        <div className="flex items-center gap-2 font-mono text-xs justify-end">
          <button
            onClick={onOpenWatchlist}
            className="px-3 py-1.5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark uppercase text-[11px] font-semibold flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-signal" />
            <span>WATCHLIST</span>
          </button>

          <button
            onClick={onOpenSavedSearches}
            className="px-3 py-1.5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark uppercase text-[11px] font-semibold flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-signal" />
            <span>SAVED SEARCHES</span>
          </button>
        </div>

      </div>

      {/* Primary Search Input Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-ink-muted dark:text-ink-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ledger by job title, company, location, or skill..."
            className="w-full bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark rounded-none pl-10 pr-20 py-2 text-xs font-mono text-ink dark:text-ink-dark placeholder:text-ink-muted dark:placeholder:text-ink-dark-muted focus:outline-none focus:border-ink dark:focus:border-ink-dark transition-colors"
          />
          <button
            onClick={onOpenCommandPalette}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-line dark:border-line-dark bg-paper dark:bg-paper-dark font-mono text-[10px] text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark"
          >
            ⌘K
          </button>
        </div>

        {/* Collapsible Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-ink dark:text-ink-dark text-xs font-mono font-semibold uppercase shrink-0 transition-colors hover:border-ink dark:hover:border-ink-dark"
        >
          <Filter className="w-3.5 h-3.5 text-signal" />
          <span>ADVANCED FILTERS</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

      </div>

      {/* Progressive Disclosure Advanced Filters Panel */}
      {showAdvanced && (
        <div className="pt-3 border-t border-line dark:border-line-dark grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs animate-ledger-enter">
          
          {/* Source Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-dark-muted block">
              Source Portal
            </label>
            <select
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark px-3 py-1.5 text-xs text-ink dark:text-ink-dark focus:outline-none focus:border-ink dark:focus:border-ink-dark capitalize"
            >
              <option value="all">All Sources</option>
              <option value="linkedin">LinkedIn</option>
              <option value="indeed">Indeed</option>
              <option value="glassdoor">Glassdoor</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="lever">Lever</option>
              <option value="ashby">Ashby</option>
            </select>
          </div>

          {/* Min Score Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-ink-muted dark:text-ink-dark-muted">
              <span>Min Score</span>
              <span className="text-signal font-bold">{minScore}</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="w-full accent-signal cursor-pointer pt-1"
            />
          </div>

          {/* Remote Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-dark-muted block">
              Location Filter
            </label>
            <button
              onClick={() => onRemoteOnlyChange(!remoteOnly)}
              className={`w-full py-1.5 border font-semibold uppercase text-xs transition-all ${
                remoteOnly
                  ? 'bg-signal text-white border-signal'
                  : 'bg-paper-subtle dark:bg-paper-dark-subtle border-line dark:border-line-dark text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark'
              }`}
            >
              {remoteOnly ? 'REMOTE ONLY' : 'ALL LOCATIONS'}
            </button>
          </div>

          {/* Reset Filters */}
          <div className="space-y-1 flex flex-col justify-end">
            <button
              onClick={onReset}
              className="w-full py-1.5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark uppercase font-semibold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET FILTERS</span>
            </button>
          </div>

        </div>
      )}

      {/* Footer Meta & Keyboard Shortcuts Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-ink-muted dark:text-ink-dark-muted pt-1 gap-2">
        <div>
          DISPLAYING <strong className="text-ink dark:text-ink-dark">{totalFilteredCount}</strong> RECORDED POSITIONS
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase">
          <span><kbd className="border border-line dark:border-line-dark px-1 bg-paper-subtle dark:bg-paper-dark-subtle">J/K</kbd> MOVE</span>
          <span><kbd className="border border-line dark:border-line-dark px-1 bg-paper-subtle dark:bg-paper-dark-subtle">O</kbd> OPEN</span>
          <span><kbd className="border border-line dark:border-line-dark px-1 bg-paper-subtle dark:bg-paper-dark-subtle">S</kbd> SAVE</span>
        </div>
      </div>

    </div>
  );
};
