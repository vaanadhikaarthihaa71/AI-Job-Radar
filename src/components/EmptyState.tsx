import React from 'react';
import { Search, Star, CheckCircle, EyeOff, Building2, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'saved' | 'applied' | 'hidden' | 'watchlist';
  onResetSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onResetSearch }) => {
  const configs = {
    search: {
      icon: <Search className="w-8 h-8 text-indigo-400" />,
      title: 'No Matching Jobs Found',
      description: 'No job postings matched your current search filters or keywords. Try broadening your criteria or resetting filters.',
      action: onResetSearch ? (
        <button
          onClick={onResetSearch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      ) : null,
    },
    saved: {
      icon: <Star className="w-8 h-8 text-amber-400" />,
      title: 'No Saved Jobs Yet',
      description: 'You haven\'t bookmarked any job postings. Press "S" on any job card or click the star button to save listings for later.',
      action: null,
    },
    applied: {
      icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
      title: 'No Applied Jobs Recorded',
      description: 'Keep track of your job applications here. Mark listings as "Applied" on any job card after submitting your application.',
      action: null,
    },
    hidden: {
      icon: <EyeOff className="w-8 h-8 text-rose-400" />,
      title: 'No Hidden Jobs',
      description: 'You haven\'t hidden any job postings. Hide unwanted listings to keep your main live stream clean and focused.',
      action: null,
    },
    watchlist: {
      icon: <Building2 className="w-8 h-8 text-purple-400" />,
      title: 'Empty Watchlist',
      description: 'No target companies are currently monitored in your watchlist.',
      action: null,
    },
  };

  const config = configs[type];

  return (
    <div className="glass-panel rounded-2xl p-12 text-center my-8 animate-slide-down">
      <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
        {config.icon}
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{config.title}</h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        {config.description}
      </p>
      {config.action}
    </div>
  );
};
