import React from 'react';
import { ArrowUp } from 'lucide-react';

interface NewJobsPillProps {
  count: number;
  onFlush: () => void;
}

export const NewJobsPill: React.FC<NewJobsPillProps> = ({ count, onFlush }) => {
  if (count === 0) return null;

  return (
    <div className="sticky top-14 z-30 flex justify-center mb-6 animate-slide-down">
      <button
        onClick={onFlush}
        className="flex items-center gap-2 px-4 py-2 bg-signal text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg hover:bg-signal/90 active:scale-95 transition-all group border border-white/20"
      >
        <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        <span>{count} {count === 1 ? 'NEW JOB' : 'NEW JOBS'} DISCOVERED — CLICK TO REFRESH</span>
      </button>
    </div>
  );
};
