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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-slide-down">
      <div className="glass-panel w-full max-w-xl rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Saved Searches & Alerts</h2>
              <p className="text-xs text-slate-400">Save your filter criteria and enable browser notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Search Form */}
        <form onSubmit={handleSaveCurrent} className="p-6 border-b border-slate-800 bg-slate-900/60 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Save Current Filter Configuration
          </h3>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Give this search a name (e.g. Remote Python Developer)"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!searchName.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Send browser notification when new matching job arrives</span>
            </label>
          </div>
        </form>

        {/* Saved Searches List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {savedSearches.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No saved searches saved yet.
            </div>
          ) : (
            savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{search.name}</span>
                    {search.notify ? (
                      <Bell className="w-3 h-3 text-amber-400" />
                    ) : (
                      <BellOff className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    {search.query && <span>&quot;{search.query}&quot;</span>}
                    {search.remoteOnly && <span className="text-purple-300">Remote</span>}
                    {search.minScore > 0 && <span className="font-mono">Score &gt;= {search.minScore}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onApplySearch(search);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs flex items-center gap-1 font-medium px-2.5"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Apply</span>
                  </button>
                  <button
                    onClick={() => onDeleteSearch(search.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
