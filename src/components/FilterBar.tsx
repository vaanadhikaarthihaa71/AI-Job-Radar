import React from 'react';
import { Search, Filter, Globe, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSource: string;
  onSourceChange: (s: string) => void;
  remoteOnly: boolean;
  onRemoteOnlyChange: (r: boolean) => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  onReset: () => void;
  totalFilteredCount: number;
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
  onReset,
  totalFilteredCount,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 shadow-xl space-y-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, company, skills..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
          
          {/* Source Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 capitalize"
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

          {/* Min Score Filter */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400">Min Score:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono font-semibold text-indigo-300 w-6">{minScore}</span>
          </div>

          {/* Remote Toggle */}
          <button
            onClick={() => onRemoteOnlyChange(!remoteOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              remoteOnly
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Remote Only</span>
          </button>

          {/* Reset Filters Button */}
          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 border-t border-slate-800/60 pt-2.5">
        <span>Showing <strong className="text-slate-300">{totalFilteredCount}</strong> matching job postings</span>
      </div>
    </div>
  );
};
