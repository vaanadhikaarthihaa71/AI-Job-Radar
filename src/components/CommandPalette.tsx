import React, { useEffect, useState, useMemo } from 'react';
import { Search, Globe, Star, CheckCircle, EyeOff, Building2, Filter, X, Zap } from 'lucide-react';

export interface CommandAction {
  id: string;
  title: string;
  category: 'Filter' | 'Navigation' | 'Action';
  icon: React.ReactNode;
  handler: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandAction[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape & handle global Cmd+K / Ctrl+K hotkey
  useEffect(() => {
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter(
      (a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredActions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredActions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].handler();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-slide-down">
      <div
        className="glass-panel w-full max-w-xl rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-indigo-400 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search filters (Cmd+K)..."
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No command matching &quot;{query}&quot;
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    action.handler();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? 'text-white' : 'text-slate-400'}>
                      {action.icon}
                    </span>
                    <span>{action.title}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {action.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hotkey Tips */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">↵</kbd> select</span>
            <span><kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">esc</kbd> close</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-indigo-400">
            <Zap className="w-3 h-3" />
            <span>Job Radar Commands</span>
          </div>
        </div>
      </div>
    </div>
  );
};
