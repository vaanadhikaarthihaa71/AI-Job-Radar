import React, { useState } from 'react';
import { Search, Filter, Globe, RotateCcw, ChevronDown, ChevronUp, Star, CheckCircle, EyeOff, Building2, Bookmark } from 'lucide-react';
import { JobStatus } from '../hooks/useJobStatus';

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
    <div className="glass-panel rounded-2xl p-4 mb-6 shadow-xl space-y-4">
      
      {/* Top Main Row: Status Tabs & Cmd+K Shortcut */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => onTabChange('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>All Stream</span>
            <span className="text-[10px] opacity-75 font-mono">({statusCounts.all})</span>
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved</span>
            <span className="text-[10px] opacity-75 font-mono">({statusCounts.saved})</span>
          </button>

          <button
            onClick={() => onTabChange('applied')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'applied'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Applied</span>
            <span className="text-[10px] opacity-75 font-mono">({statusCounts.applied})</span>
          </button>

          <button
            onClick={() => onTabChange('hidden')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hidden'
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Hidden</span>
            <span className="text-[10px] opacity-75 font-mono">({statusCounts.hidden})</span>
          </button>
        </div>

        {/* Watchlist & Saved Searches Modal Triggers */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onOpenWatchlist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Watchlist</span>
          </button>

          <button
            onClick={onOpenSavedSearches}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-all"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved Searches</span>
          </button>
        </div>

      </div>

      {/* Primary Search Row & Progressive Disclosure Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Main Search Input */}
        <div className="relative w-full md:w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs, skills, or companies..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {/* Cmd+K Trigger Badge */}
          <button
            onClick={onOpenCommandPalette}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>⌘K</span>
          </button>
        </div>

        {/* Advanced Filters Toggle Button */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium shrink-0 transition-all"
        >
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Advanced Filters</span>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

      </div>

      {/* Progressive Disclosure Collapsible Advanced Filters Panel */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-down">
          
          {/* Source Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Job Source
            </label>
            <select
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 capitalize"
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
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              <span>Min Relevance Score</span>
              <span className="font-mono text-indigo-400 font-bold">{minScore}</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer pt-2"
            />
          </div>

          {/* Remote Only Toggle */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Location Filter
            </label>
            <button
              onClick={() => onRemoteOnlyChange(!remoteOnly)}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                remoteOnly
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{remoteOnly ? 'Remote Jobs Only' : 'All Locations'}</span>
            </button>
          </div>

          {/* Reset Filters */}
          <div className="space-y-1 flex flex-col justify-end">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>

        </div>
      )}

      {/* Footer Info & Keyboard Tips */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 px-1 border-t border-slate-800/60 pt-2.5 gap-2">
        <div>
          Showing <strong className="text-slate-300 font-mono">{totalFilteredCount}</strong> matching job postings
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span><kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">J/K</kbd> navigate</span>
          <span><kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">O</kbd> open link</span>
          <span><kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">S</kbd> save job</span>
        </div>
      </div>

    </div>
  );
};
