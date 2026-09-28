import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRealtimeJobs } from './hooks/useRealtimeJobs';
import { useJobStatus } from './hooks/useJobStatus';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { FilterBar, MainTab } from './components/FilterBar';
import { NewJobsPill } from './components/NewJobsPill';
import { JobFeed } from './components/JobFeed';
import { CommandPalette, CommandAction } from './components/CommandPalette';
import { WatchlistModal } from './components/WatchlistModal';
import { SavedSearchesModal } from './components/SavedSearchesModal';
import { Globe, Star, CheckCircle, RotateCcw, Search, Building2 } from 'lucide-react';

export function App() {
  const { theme, toggleTheme } = useTheme();

  const {
    jobs,
    bufferedJobsCount,
    isPaused,
    connectionState,
    errorMessage,
    nextScanInSeconds,
    stats,
    togglePause,
    flushBuffer,
  } = useRealtimeJobs();

  const {
    savedSearches,
    setJobStatus,
    toggleSaveJob,
    getJobStatus,
    addSavedSearch,
    deleteSavedSearch,
  } = useJobStatus();

  const [activeTab, setActiveTab] = useState<MainTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);

  // Modals visibility state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState(false);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Filtered jobs computation
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const status = getJobStatus(job.id);

      // Status Tab Filtering
      if (activeTab === 'saved' && status !== 'saved') return false;
      if (activeTab === 'applied' && status !== 'applied') return false;
      if (activeTab === 'hidden' && status !== 'hidden') return false;
      if (activeTab === 'all' && status === 'hidden') return false;

      // Keyword search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const titleMatch = job.title.toLowerCase().includes(query);
        const companyMatch = job.company.toLowerCase().includes(query);
        const locationMatch = job.location.toLowerCase().includes(query);
        const skillMatch = job.matched_skills?.some((s) => s.toLowerCase().includes(query));

        if (!titleMatch && !companyMatch && !locationMatch && !skillMatch) {
          return false;
        }
      }

      // Source filter
      if (selectedSource !== 'all') {
        if (job.source?.toLowerCase() !== selectedSource.toLowerCase()) {
          return false;
        }
      }

      // Remote filter
      if (remoteOnly && !job.is_remote) {
        return false;
      }

      // Min Score filter
      if (job.score < minScore) {
        return false;
      }

      return true;
    });
  }, [jobs, activeTab, getJobStatus, searchQuery, selectedSource, remoteOnly, minScore]);

  // Keyboard Navigation Hook
  const { selectedIndex } = useKeyboardNav({
    jobs: filteredJobs,
    onToggleSaveJob: toggleSaveJob,
    enabled: !isCommandPaletteOpen && !isWatchlistOpen && !isSavedSearchesOpen,
  });

  // Count per status tab
  const statusCounts = useMemo(() => {
    let saved = 0;
    let applied = 0;
    let hidden = 0;
    let all = 0;

    jobs.forEach((j) => {
      const st = getJobStatus(j.id);
      if (st === 'saved') saved++;
      if (st === 'applied') applied++;
      if (st === 'hidden') hidden++;
      if (st !== 'hidden') all++;
    });

    return { all, saved, applied, hidden };
  }, [jobs, getJobStatus]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSource('all');
    setRemoteOnly(false);
    setMinScore(0);
    setActiveTab('all');
  }, []);

  // Command Palette Actions
  const commandActions: CommandAction[] = useMemo(
    () => [
      {
        id: 'remote',
        title: 'Filter: Remote Jobs Only',
        category: 'Filter',
        icon: <Globe className="w-4 h-4 text-signal" />,
        handler: () => setRemoteOnly(true),
      },
      {
        id: 'high_score',
        title: 'Filter: High Relevancy (>80 Score)',
        category: 'Filter',
        icon: <Star className="w-4 h-4 text-signal" />,
        handler: () => setMinScore(80),
      },
      {
        id: 'greenhouse',
        title: 'Filter: Greenhouse ATS Jobs',
        category: 'Filter',
        icon: <Search className="w-4 h-4 text-ink dark:text-ink-dark" />,
        handler: () => setSelectedSource('greenhouse'),
      },
      {
        id: 'tab_saved',
        title: 'View: Saved Jobs',
        category: 'Navigation',
        icon: <Star className="w-4 h-4 text-signal" />,
        handler: () => setActiveTab('saved'),
      },
      {
        id: 'tab_applied',
        title: 'View: Applied Jobs',
        category: 'Navigation',
        icon: <CheckCircle className="w-4 h-4 text-ink dark:text-ink-dark" />,
        handler: () => setActiveTab('applied'),
      },
      {
        id: 'watchlist',
        title: 'View: Company Watchlist',
        category: 'Navigation',
        icon: <Building2 className="w-4 h-4 text-signal" />,
        handler: () => setIsWatchlistOpen(true),
      },
      {
        id: 'reset',
        title: 'Action: Reset All Filters',
        category: 'Action',
        icon: <RotateCcw className="w-4 h-4 text-ink-muted dark:text-ink-dark-muted" />,
        handler: handleResetFilters,
      },
    ],
    [handleResetFilters]
  );

  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark flex flex-col selection:bg-signal selection:text-white pb-16 transition-colors duration-200">
      
      {/* Morning Briefing Header */}
      <Header
        connectionState={connectionState}
        stats={stats}
        isPaused={isPaused}
        onTogglePause={togglePause}
        theme={theme}
        onToggleTheme={toggleTheme}
        errorMessage={errorMessage}
        nextScanInSeconds={nextScanInSeconds}
      />

      {/* Main Newspaper Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 flex-1 w-full pt-6">
        
        {/* Newspaper Filter Strip */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          remoteOnly={remoteOnly}
          onRemoteOnlyChange={setRemoteOnly}
          minScore={minScore}
          onMinScoreChange={setMinScore}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenWatchlist={() => setIsWatchlistOpen(true)}
          onOpenSavedSearches={() => setIsSavedSearchesOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onReset={handleResetFilters}
          totalFilteredCount={filteredJobs.length}
          statusCounts={statusCounts}
        />

        {/* Floating Signal Refresh Pill */}
        {isPaused && (
          <NewJobsPill count={bufferedJobsCount} onFlush={flushBuffer} />
        )}

        {/* Editorial Job Ledger Feed */}
        <JobFeed
          jobs={filteredJobs}
          activeTab={activeTab}
          selectedIndex={selectedIndex}
          getJobStatus={getJobStatus}
          onSetStatus={setJobStatus}
          onToggleSave={toggleSaveJob}
          onResetSearch={handleResetFilters}
        />

      </main>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        actions={commandActions}
      />

      {/* Company Watchlist Modal */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        jobs={jobs}
      />

      {/* Saved Searches Modal */}
      <SavedSearchesModal
        isOpen={isSavedSearchesOpen}
        onClose={() => setIsSavedSearchesOpen(false)}
        savedSearches={savedSearches}
        onAddSearch={addSavedSearch}
        onDeleteSearch={deleteSavedSearch}
        onApplySearch={(s) => {
          setSearchQuery(s.query);
          setSelectedSource(s.source);
          setRemoteOnly(s.remoteOnly);
          setMinScore(s.minScore);
        }}
        currentSearchQuery={searchQuery}
        currentSource={selectedSource}
        currentRemoteOnly={remoteOnly}
        currentMinScore={minScore}
      />

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-line dark:border-line-dark py-6 text-center text-xs font-mono text-ink-muted dark:text-ink-dark-muted">
        <p>JOB RADAR INTELLIGENCE BRIEFING &copy; 2026. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}

export default App;
