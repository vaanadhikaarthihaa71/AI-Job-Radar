import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface NewJobsPillProps {
  count: number;
  onFlush: () => void;
}

export const NewJobsPill: React.FC<NewJobsPillProps> = ({ count, onFlush }) => {
  if (count === 0) return null;

  return (
    <div className="sticky top-20 z-30 flex justify-center mb-6 animate-slide-down">
      <button
        onClick={onFlush}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-xl shadow-indigo-500/25 ring-2 ring-white/20 hover:scale-105 active:scale-95 transition-all duration-200 group"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
        <span>{count} {count === 1 ? 'new job' : 'new jobs'}, click to show</span>
        <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};
