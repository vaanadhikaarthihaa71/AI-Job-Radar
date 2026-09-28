import React, { useState } from 'react';
import { Bookmark, X, Trash2, Bell, BellOff, Play, Plus } from 'lucide-react';
import { SavedSearch } from '../hooks/useJobStatus';

interface SavedSearchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSearches: SavedSearch[];
  onAddSearch: (search: Omit<SavedSearch, 'id' | 'createdAt'>) => void;
  onDeleteSearch: (id: string) => void;
  onApplySearch: (search: SavedSearch) => void;
  currentSearchQuery: string;
  currentSource: string;
  currentRemoteOnly: boolean;
  currentMinScore: number;
}

export const SavedSearchesModal: React.FC<SavedSearchesModalProps> = ({
  isOpen,
  onClose,
  savedSearches,
  onAddSearch,
  onDeleteSearch,
  onApplySearch,
  currentSearchQuery,
  currentSource,
  currentRemoteOnly,
  currentMinScore,
}) => {
  const [searchName, setSearchName] = useState('');
  const [notify, setNotify] = useState(true);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) return;

    onAddSearch({
      name: searchName.trim(),
      query: currentSearchQuery,
      source: currentSource,
      remoteOnly: currentRemoteOnly,
      minScore: currentMinScore,
      notify: notify,
    });

    setSearchName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 dark:bg-black/80 flex items-center justify-center p-4 animate-ledger-enter">
      <div className="w-full max-w-xl bg-paper dark:bg-paper-dark border-2 border-ink dark:border-ink-dark shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line dark:border-line-dark">
          <div className="flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-signal" />
            <div>
              <h2 className="text-base font-serif font-bold text-ink dark:text-ink-dark">Saved Filter Presets</h2>
              <p className="text-xs text-ink-muted dark:text-ink-dark-muted">Save search parameters and browser notification alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Search Form */}
        <form onSubmit={handleSaveCurrent} className="p-6 border-b border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle space-y-3">
          <h3 className="text-xs font-bold text-ink dark:text-ink-dark uppercase">
            Save Current Active Filter Parameters
          </h3>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Preset Name (e.g., Remote Python Engineers)"
              className="flex-1 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark px-3 py-2 text-xs text-ink dark:text-ink-dark placeholder:text-ink-muted dark:placeholder:text-ink-dark-muted focus:outline-none focus:border-ink dark:focus:border-ink-dark"
            />
            <button
              type="submit"
              disabled={!searchName.trim()}
              className="px-4 py-2 bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-bold text-xs uppercase hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>SAVE</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-ink-muted dark:text-ink-dark-muted">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="accent-signal cursor-pointer"
              />
              <span>Trigger browser notifications on new matching jobs</span>
            </label>
          </div>
        </form>

        {/* Saved Searches List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {savedSearches.length === 0 ? (
            <div className="text-center py-8 text-xs text-ink-muted dark:text-ink-dark-muted">
              No saved filter presets yet.
            </div>
          ) : (
            savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3.5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle hover:border-ink dark:hover:border-ink-dark transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink dark:text-ink-dark">{search.name}</span>
                    {search.notify ? (
                      <Bell className="w-3.5 h-3.5 text-signal" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 text-ink-muted dark:text-ink-dark-muted" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-muted dark:text-ink-dark-muted">
                    {search.query && <span>&quot;{search.query}&quot;</span>}
                    {search.remoteOnly && <span className="text-signal">REMOTE</span>}
                    {search.minScore > 0 && <span>SCORE &gt;= {search.minScore}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onApplySearch(search);
                      onClose();
                    }}
                    className="px-3 py-1 bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-bold text-xs uppercase hover:opacity-90 transition-opacity flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>APPLY</span>
                  </button>
                  <button
                    onClick={() => onDeleteSearch(search.id)}
                    className="p-1 text-ink-muted dark:text-ink-dark-muted hover:text-signal transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
