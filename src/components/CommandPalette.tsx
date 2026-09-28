import React, { useEffect, useState, useMemo } from 'react';
import { Search, Globe, Star, CheckCircle, RotateCcw, X, Building2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-ink/70 dark:bg-black/80 flex items-start justify-center pt-20 px-4 animate-ledger-enter">
      <div
        className="w-full max-w-xl bg-paper dark:bg-paper-dark border-2 border-ink dark:border-ink-dark shadow-2xl overflow-hidden flex flex-col font-mono"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-line dark:border-line-dark">
          <Search className="w-4 h-4 text-signal mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or filter term (Cmd+K)..."
            className="w-full bg-transparent text-ink dark:text-ink-dark placeholder:text-ink-muted dark:placeholder:text-ink-dark-muted text-xs focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-muted dark:text-ink-dark-muted">
              No command matches &quot;{query}&quot;
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
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold uppercase transition-all ${
                    isSelected
                      ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark'
                      : 'text-ink dark:text-ink-dark hover:bg-paper-subtle dark:hover:bg-paper-dark-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{action.icon}</span>
                    <span>{action.title}</span>
                  </div>
                  <span className="text-[10px] opacity-75 border border-current px-1.5 py-0.5">
                    {action.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hotkey Tips */}
        <div className="px-4 py-2 bg-paper-subtle dark:bg-paper-dark-subtle border-t border-line dark:border-line-dark flex items-center justify-between text-[10px] text-ink-muted dark:text-ink-dark-muted uppercase">
          <div className="flex items-center gap-3">
            <span><kbd className="border border-line dark:border-line-dark px-1">↑↓</kbd> NAVIGATE</span>
            <span><kbd className="border border-line dark:border-line-dark px-1">↵</kbd> SELECT</span>
            <span><kbd className="border border-line dark:border-line-dark px-1">ESC</kbd> CLOSE</span>
          </div>
          <div className="text-signal font-bold">COMMAND DIRECTORY</div>
        </div>
      </div>
    </div>
  );
};
