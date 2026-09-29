import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Globe,
  SlidersHorizontal,
  Star,
  Check,
  Building,
} from 'lucide-react';

interface FilterSidebarProps {
  selectedIndustry: string;
  onIndustryChange: (ind: string) => void;
  selectedSource: string;
  onSourceChange: (src: string) => void;
  remoteOnly: boolean;
  onRemoteOnlyChange: (remote: boolean) => void;
  indiaOnly: boolean;
  onIndiaOnlyChange: (india: boolean) => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  selectedSeniority: string;
  onSeniorityChange: (sen: string) => void;
  onReset: () => void;
  totalFilteredCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedIndustry,
  onIndustryChange,
  selectedSource,
  onSourceChange,
  remoteOnly,
  onRemoteOnlyChange,
  indiaOnly,
  onIndiaOnlyChange,
  minScore,
  onMinScoreChange,
  selectedSeniority,
  onSeniorityChange,
  onReset,
  totalFilteredCount,
}) => {
  // Collapsible state for filter sections
  const [openSections, setOpenSections] = useState({
    industry: true,
    location: true,
    experience: true,
    score: true,
    source: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    selectedIndustry !== 'all' ||
    selectedSource !== 'all' ||
    remoteOnly ||
    indiaOnly ||
    minScore > 0 ||
    selectedSeniority !== 'all';

  return (
    <aside className="w-full space-y-4 text-xs font-sans">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line dark:border-line-dark">
        <div className="flex items-center gap-2 font-serif text-base font-bold text-ink dark:text-ink-dark">
          <SlidersHorizontal className="w-4 h-4 text-signal" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[11px] font-mono text-signal hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset all</span>
          </button>
        )}
      </div>

      {/* Group 1: Target Role / Industry */}
      <div className="border-b border-line/60 dark:border-line-dark/60 pb-3">
        <button
          onClick={() => toggleSection('industry')}
          className="w-full flex items-center justify-between py-1 text-ink dark:text-ink-dark font-semibold text-xs text-left"
        >
          <span>Target Industry</span>
          {openSections.industry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.industry && (
          <div className="mt-2 space-y-1 text-xs">
            {[
              { id: 'all', label: 'All Industries' },
              { id: 'tech', label: 'Tech & Software' },
              { id: 'finance', label: 'Finance & Banking' },
              { id: 'healthcare', label: 'Healthcare & Biotech' },
              { id: 'marketing', label: 'Marketing & Sales' },
              { id: 'design', label: 'Design & Product' },
              { id: 'education', label: 'Education & Research' },
              { id: 'trades', label: 'Skilled Trades & Operations' },
            ].map((ind) => (
              <button
                key={ind.id}
                onClick={() => onIndustryChange(ind.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-sm transition-colors flex items-center justify-between ${
                  selectedIndustry.toLowerCase() === ind.id.toLowerCase()
                    ? 'bg-ink/5 dark:bg-ink-dark/10 font-semibold text-ink dark:text-ink-dark'
                    : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-ink/5 dark:hover:bg-ink-dark/5'
                }`}
              >
                <span>{ind.label}</span>
                {selectedIndustry.toLowerCase() === ind.id.toLowerCase() && (
                  <Check className="w-3.5 h-3.5 text-signal" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Group 2: Work Setup / Location */}
      <div className="border-b border-line/60 dark:border-line-dark/60 pb-3">
        <button
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between py-1 text-ink dark:text-ink-dark font-semibold text-xs text-left"
        >
          <span>Location & Work Setup</span>
          {openSections.location ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.location && (
          <div className="mt-2 space-y-2">
            
            {/* Remote Only Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-ink dark:text-ink-dark hover:text-signal transition-colors">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => onRemoteOnlyChange(e.target.checked)}
                className="rounded-none border-line dark:border-line-dark text-signal focus:ring-0"
              />
              <span className="font-medium">Remote Positions Only</span>
            </label>

            {/* India Jobs Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-ink dark:text-ink-dark hover:text-emerald-600 transition-colors">
              <input
                type="checkbox"
                checked={indiaOnly}
                onChange={(e) => onIndiaOnlyChange(e.target.checked)}
                className="rounded-none border-line dark:border-line-dark text-emerald-600 focus:ring-0"
              />
              <span className="font-medium flex items-center gap-1">
                <span>🇮🇳 India Based Opportunities</span>
              </span>
            </label>

          </div>
        )}
      </div>

      {/* Group 3: Match Score Threshold */}
      <div className="border-b border-line/60 dark:border-line-dark/60 pb-3">
        <button
          onClick={() => toggleSection('score')}
          className="w-full flex items-center justify-between py-1 text-ink dark:text-ink-dark font-semibold text-xs text-left"
        >
          <span>Minimum Match Score</span>
          {openSections.score ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.score && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-ink-muted dark:text-ink-dark-muted">Threshold</span>
              <span className="font-bold text-signal px-1.5 py-0.5 bg-signal/10 rounded-sm">
                {minScore > 0 ? `${minScore}% match` : 'All matches'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="w-full accent-signal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-muted dark:text-ink-dark-muted">
              <span>Any</span>
              <span>70% (High)</span>
              <span>90% (Top)</span>
            </div>
          </div>
        )}
      </div>

      {/* Group 4: Seniority Level */}
      <div className="border-b border-line/60 dark:border-line-dark/60 pb-3">
        <button
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between py-1 text-ink dark:text-ink-dark font-semibold text-xs text-left"
        >
          <span>Experience Level</span>
          {openSections.experience ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.experience && (
          <div className="mt-2 space-y-1">
            {[
              { id: 'all', label: 'All Levels' },
              { id: 'entry', label: 'Entry Level / Junior' },
              { id: 'mid', label: 'Mid Level' },
              { id: 'senior', label: 'Senior / Lead' },
              { id: 'executive', label: 'Director / Executive' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => onSeniorityChange(lvl.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-sm transition-colors flex items-center justify-between ${
                  selectedSeniority.toLowerCase() === lvl.id.toLowerCase()
                    ? 'bg-ink/5 dark:bg-ink-dark/10 font-semibold text-ink dark:text-ink-dark'
                    : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-ink/5 dark:hover:bg-ink-dark/5'
                }`}
              >
                <span>{lvl.label}</span>
                {selectedSeniority.toLowerCase() === lvl.id.toLowerCase() && (
                  <Check className="w-3.5 h-3.5 text-signal" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Group 5: Source Portals */}
      <div>
        <button
          onClick={() => toggleSection('source')}
          className="w-full flex items-center justify-between py-1 text-ink dark:text-ink-dark font-semibold text-xs text-left"
        >
          <span>Source Portal</span>
          {openSections.source ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSections.source && (
          <div className="mt-2 space-y-1">
            {[
              { id: 'all', label: 'All Portals' },
              { id: 'indeed', label: 'Indeed' },
              { id: 'linkedin', label: 'LinkedIn' },
              { id: 'greenhouse', label: 'Greenhouse' },
              { id: 'lever', label: 'Lever' },
              { id: 'ashby', label: 'Ashby' },
            ].map((src) => (
              <button
                key={src.id}
                onClick={() => onSourceChange(src.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-sm transition-colors flex items-center justify-between ${
                  selectedSource.toLowerCase() === src.id.toLowerCase()
                    ? 'bg-ink/5 dark:bg-ink-dark/10 font-semibold text-ink dark:text-ink-dark'
                    : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-ink/5 dark:hover:bg-ink-dark/5'
                }`}
              >
                <span>{src.label}</span>
                {selectedSource.toLowerCase() === src.id.toLowerCase() && (
                  <Check className="w-3.5 h-3.5 text-signal" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
};
