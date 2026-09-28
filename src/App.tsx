import { useState, useMemo } from 'react';
import { useRealtimeJobs } from './hooks/useRealtimeJobs';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { NewJobsPill } from './components/NewJobsPill';
import { JobFeed } from './components/JobFeed';

export function App() {
  const {
    jobs,
    bufferedJobsCount,
    isPaused,
    connectionState,
    stats,
    togglePause,
    flushBuffer,
  } = useRealtimeJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);

  // Filtered jobs list computation
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
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
  }, [jobs, searchQuery, selectedSource, remoteOnly, minScore]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSource('all');
    setRemoteOnly(false);
    setMinScore(0);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-16">
      
      {/* Live Header */}
      <Header
        connectionState={connectionState}
        stats={stats}
        isPaused={isPaused}
        onTogglePause={togglePause}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 flex-1 w-full">
        
        {/* Filter Controls Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          remoteOnly={remoteOnly}
          onRemoteOnlyChange={setRemoteOnly}
          minScore={minScore}
          onMinScoreChange={setMinScore}
          onReset={handleResetFilters}
          totalFilteredCount={filteredJobs.length}
        />

        {/* Floating New Jobs Pill (When Paused) */}
        {isPaused && (
          <NewJobsPill count={bufferedJobsCount} onFlush={flushBuffer} />
        )}

        {/* Live Job Feed */}
        <JobFeed jobs={filteredJobs} />

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Job Radar Live Stream Dashboard &copy; 2026. Built with Vite, React, TypeScript, Tailwind, and Supabase Realtime.</p>
      </footer>
    </div>
  );
}

export default App;
