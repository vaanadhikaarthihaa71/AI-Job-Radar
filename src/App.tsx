import { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useRealtimeJobs } from './hooks/useRealtimeJobs';
import { useJobStatus, JobStatus } from './hooks/useJobStatus';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './context/AuthContext';
import { Header, NavTab } from './components/Header';
import { DashboardHeader } from './components/DashboardHeader';
import { FilterSidebar } from './components/FilterSidebar';
import { JobFeed } from './components/JobFeed';
import { IntelligenceCenter } from './components/IntelligenceCenter';
import { ApplicationTracker } from './components/ApplicationTracker';
import { PreferencesModal } from './components/PreferencesModal';
import { CommandPalette, CommandAction } from './components/CommandPalette';
import { WatchlistModal } from './components/WatchlistModal';
import { SavedSearchesModal } from './components/SavedSearchesModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { JobApplyModal } from './components/JobApplyModal';
import { ChatPanel } from './components/ChatPanel';
import { AuthPromptModal } from './components/AuthPromptModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Job, UserProfile } from './types/job';
import { Search, Sparkles, Globe, Star, CheckCircle, RotateCcw, Building2, SlidersHorizontal, Sliders } from 'lucide-react';

const PROFILE_STORAGE_KEY = 'job_radar_user_profile';

function DashboardView() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  // User Profile & Preferences State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);

  // Main Navigation View Tab State: 'opportunities' | 'saved' | 'applications' | 'intelligence'
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('opportunities');

  // Auth Gating Prompt State
  const [authPromptState, setAuthPromptState] = useState<{
    isOpen: boolean;
    title?: string;
    description?: string;
  }>({ isOpen: false });

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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSeniority, setSelectedSeniority] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [indiaOnly, setIndiaOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);

  // Modals & Panels visibility state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Job Traversal / Right Detail Drawer
  const [activeApplyModalJob, setActiveApplyModalJob] = useState<Job | null>(null);

  // Require Auth Wrapper for Gated Actions
  const requireAuth = (
    action: () => void,
    title: string = 'Sign In Required',
    description: string = 'Sign in to save jobs, track applications, and access AI chat.'
  ) => {
    if (user) {
      action();
    } else {
      setAuthPromptState({
        isOpen: true,
        title,
        description,
      });
    }
  };

  const handleToggleSaveJob = (jobId: string) => {
    requireAuth(
      () => toggleSaveJob(jobId),
      'Sign In to Save Jobs',
      'Sign in to bookmark job postings across all your devices.'
    );
  };

  const handleSetJobStatus = (jobId: string, status: JobStatus) => {
    requireAuth(
      () => setJobStatus(jobId, status),
      'Sign In to Track Applications',
      'Sign in to manage saved, applied, and hidden job listings.'
    );
  };

  const handleOpenChat = () => {
    requireAuth(
      () => setIsChatOpen(true),
      'Sign In for AI Assistant',
      'Sign in to chat with our grounded AI job market assistant.'
    );
  };

  const handleAddSavedSearch = (search: any) => {
    requireAuth(
      () => addSavedSearch(search),
      'Sign In to Save Searches',
      'Sign in to save custom search filters and alert preferences.'
    );
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        handleOpenChat();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [user]);

  // Complete Onboarding & Save Profile
  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    setShowOnboarding(false);
    if (profile.remoteOnly) setRemoteOnly(true);
  };

  // Re-calculate job scores
  const scoredJobs = useMemo(() => {
    if (!userProfile?.industries?.length) return jobs;

    return jobs.map((job) => {
      const baseScore = job.score || 50;
      const industryMatch = userProfile.industries?.includes(job.industry || '') ? 20 : 0;
      const computedScore = Math.min(100, baseScore + industryMatch);

      return {
        ...job,
        score: computedScore,
      };
    });
  }, [jobs, userProfile]);

  // Filtered Jobs Computation
  const filteredJobs = useMemo(() => {
    const indiaKeywords = ['india', 'bengaluru', 'bangalore', 'mumbai', 'delhi', 'gurgaon', 'noida', 'hyderabad', 'chennai', 'pune', 'tenkasi', 'kolkata', 'ahmedabad'];

    return scoredJobs.filter((job) => {
      const status = getJobStatus(job.id);

      // Hide hidden items in general stream
      if (activeNavTab === 'opportunities' && status === 'hidden') return false;

      // India Location Filter
      if (indiaOnly) {
        const locLower = (job.location || '').toLowerCase();
        const isIndiaLoc = indiaKeywords.some((k) => locLower.includes(k));
        if (!isIndiaLoc) return false;
      }

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

      // Industry filter
      if (selectedIndustry !== 'all') {
        if (job.industry?.toLowerCase() !== selectedIndustry.toLowerCase()) {
          return false;
        }
      }

      // Source filter
      if (selectedSource !== 'all') {
        if (job.source?.toLowerCase() !== selectedSource.toLowerCase()) {
          return false;
        }
      }

      // Seniority filter
      if (selectedSeniority !== 'all') {
        if (job.seniority?.toLowerCase() !== selectedSeniority.toLowerCase()) {
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
  }, [scoredJobs, activeNavTab, getJobStatus, searchQuery, selectedIndustry, selectedSource, selectedSeniority, remoteOnly, indiaOnly, minScore]);

  // Status counts for saved & applied tabs
  const statusCounts = useMemo(() => {
    let saved = 0;
    let applied = 0;
    let hidden = 0;
    let all = 0;

    scoredJobs.forEach((j) => {
      const st = getJobStatus(j.id);
      if (st === 'saved') saved++;
      if (st === 'applied') applied++;
      if (st === 'hidden') hidden++;
      if (st !== 'hidden') all++;
    });

    return { all, saved, applied, hidden };
  }, [scoredJobs, getJobStatus]);

  // Keyboard Navigation Hook
  const { selectedIndex } = useKeyboardNav({
    jobs: filteredJobs,
    onToggleSaveJob: handleToggleSaveJob,
    enabled: !isCommandPaletteOpen && !isWatchlistOpen && !isSavedSearchesOpen && !activeApplyModalJob && !showOnboarding && !isChatOpen && !authPromptState.isOpen && !isPreferencesOpen,
  });

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSource('all');
    setSelectedIndustry('all');
    setSelectedSeniority('all');
    setRemoteOnly(false);
    setIndiaOnly(false);
    setMinScore(0);
  }, []);

  // Command Palette Actions
  const commandActions: CommandAction[] = useMemo(
    () => [
      {
        id: 'open_chat',
        title: 'Action: Ask Job Radar AI Assistant (Shortcut: Cmd+Shift+C)',
        category: 'Action',
        icon: <Sparkles className="w-4 h-4 text-signal" />,
        handler: handleOpenChat,
      },
      {
        id: 'remote',
        title: 'Filter: Remote Jobs Only',
        category: 'Filter',
        icon: <Globe className="w-4 h-4 text-signal" />,
        handler: () => setRemoteOnly(true),
      },
      {
        id: 'high_score',
        title: 'Filter: High Relevancy (>80 Match Score)',
        category: 'Filter',
        icon: <Star className="w-4 h-4 text-signal" />,
        handler: () => setMinScore(80),
      },
      {
        id: 'setup_industry',
        title: 'Action: Edit Career Focus & Preferences',
        category: 'Action',
        icon: <SlidersHorizontal className="w-4 h-4 text-signal" />,
        handler: () => setIsPreferencesOpen(true),
      },
      {
        id: 'tab_saved',
        title: 'View: Saved Opportunities',
        category: 'Navigation',
        icon: <Star className="w-4 h-4 text-signal" />,
        handler: () => setActiveNavTab('saved'),
      },
      {
        id: 'tab_applied',
        title: 'View: Applications Pipeline',
        category: 'Navigation',
        icon: <CheckCircle className="w-4 h-4 text-ink dark:text-ink-dark" />,
        handler: () => setActiveNavTab('applications'),
      },
      {
        id: 'tab_intelligence',
        title: 'View: Market Intelligence Center',
        category: 'Navigation',
        icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
        handler: () => setActiveNavTab('intelligence'),
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
    <div className="min-h-screen bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark flex flex-col font-sans selection:bg-signal selection:text-white pb-16 transition-colors duration-200">
      
      {/* 3-Step Guided Onboarding Modal */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleSaveProfile}
          initialProfile={userProfile}
        />
      )}

      {/* Preferences & Career Focus Drawer */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Global Navigation Header */}
      <Header
        connectionState={connectionState}
        stats={stats}
        isPaused={isPaused}
        onTogglePause={togglePause}
        theme={theme}
        onToggleTheme={toggleTheme}
        userProfile={userProfile}
        onOpenOnboarding={() => setIsPreferencesOpen(true)}
        onOpenChat={handleOpenChat}
        errorMessage={errorMessage}
        nextScanInSeconds={nextScanInSeconds}
        activeNavTab={activeNavTab}
        onNavTabChange={setActiveNavTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        onOpenSavedSearches={() => setIsSavedSearchesOpen(true)}
        savedCount={statusCounts.saved}
        appliedCount={statusCounts.applied}
      />

      {/* Main Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pt-4">
        
        {/* ================= VIEW 1: OPPORTUNITIES DISCOVERY (CORE 2-COLUMN LAYOUT) ================= */}
        {activeNavTab === 'opportunities' && (
          <div className="space-y-6">
            
            {/* Top Dashboard Header Greeting & Compact Metrics */}
            <DashboardHeader
              userProfile={userProfile}
              totalMatchCount={filteredJobs.length}
              newTodayCount={stats.jobsLastHour || 12}
              highMatchCount={scoredJobs.filter((j) => j.score >= 80).length}
              remoteCount={scoredJobs.filter((j) => j.is_remote).length}
              onOpenPreferences={() => setIsPreferencesOpen(true)}
              onOpenChat={handleOpenChat}
            />

            {/* Main 2-Column Discovery Interface */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* LEFT COLUMN: Collapsible Filter Sidebar (Desktop) */}
              <div className="w-full md:w-64 shrink-0 hidden md:block sticky top-24">
                <FilterSidebar
                  selectedIndustry={selectedIndustry}
                  onIndustryChange={setSelectedIndustry}
                  selectedSource={selectedSource}
                  onSourceChange={setSelectedSource}
                  remoteOnly={remoteOnly}
                  onRemoteOnlyChange={setRemoteOnly}
                  indiaOnly={indiaOnly}
                  onIndiaOnlyChange={setIndiaOnly}
                  minScore={minScore}
                  onMinScoreChange={setMinScore}
                  selectedSeniority={selectedSeniority}
                  onSeniorityChange={setSelectedSeniority}
                  onReset={handleResetFilters}
                  totalFilteredCount={filteredJobs.length}
                />
              </div>

              {/* RIGHT COLUMN: Job Discovery Feed */}
              <div className="flex-1 w-full space-y-4">
                
                {/* Search Bar & Sort / Mobile Filter Strip */}
                <div className="space-y-3 pb-3 border-b border-line dark:border-line-dark">
                  
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-ink-muted dark:text-ink-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search jobs, skills, companies..."
                        className="w-full bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark rounded-sm pl-10 pr-20 py-2.5 text-xs text-ink dark:text-ink-dark placeholder:text-ink-muted dark:placeholder:text-ink-dark-muted focus:outline-none focus:border-signal"
                      />
                      <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-line dark:border-line-dark bg-paper dark:bg-paper-dark font-mono text-[10px] text-ink-muted dark:text-ink-dark-muted rounded-sm"
                      >
                        ⌘K
                      </button>
                    </div>

                    <button
                      onClick={() => setIsSavedSearchesOpen(true)}
                      className="px-3 py-2.5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle hover:border-ink dark:hover:border-ink-dark text-xs font-sans text-ink dark:text-ink-dark rounded-sm transition-colors shrink-0 hidden sm:flex items-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-signal" />
                      <span>Saved Searches</span>
                    </button>
                  </div>

                  {/* Mobile Filters Toggle Strip */}
                  <div className="flex md:hidden items-center justify-between font-mono text-xs text-ink-muted dark:text-ink-dark-muted">
                    <div>
                      <span>{filteredJobs.length} opportunities</span>
                    </div>
                    <button
                      onClick={() => setIsPreferencesOpen(true)}
                      className="px-3 py-1 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-ink dark:text-ink-dark rounded-sm flex items-center gap-1 text-[11px]"
                    >
                      <Sliders className="w-3 h-3 text-signal" />
                      <span>Filters</span>
                    </button>
                  </div>

                </div>

                {/* Job Listings Feed */}
                <JobFeed
                  jobs={filteredJobs}
                  activeTab="all"
                  selectedIndex={selectedIndex}
                  getJobStatus={getJobStatus}
                  onSetStatus={handleSetJobStatus}
                  onToggleSave={handleToggleSaveJob}
                  onOpenApplyModal={(j) => setActiveApplyModalJob(j)}
                  onResetSearch={handleResetFilters}
                  errorMessage={errorMessage}
                  totalDbJobsCount={scoredJobs.length}
                />

              </div>

            </div>

          </div>
        )}

        {/* ================= VIEW 2 & 3: SAVED JOBS & APPLICATIONS TRACKER ================= */}
        {(activeNavTab === 'saved' || activeNavTab === 'applications') && (
          <ApplicationTracker
            jobs={scoredJobs}
            activeTab={activeNavTab === 'saved' ? 'saved' : 'applied'}
            onTabChange={(t) => setActiveNavTab(t === 'saved' ? 'saved' : 'applications')}
            getJobStatus={getJobStatus}
            onSetStatus={handleSetJobStatus}
            onToggleSave={handleToggleSaveJob}
            onOpenApplyModal={(j) => setActiveApplyModalJob(j)}
          />
        )}

        {/* ================= VIEW 4: INTELLIGENCE CENTER ================= */}
        {activeNavTab === 'intelligence' && (
          <IntelligenceCenter jobs={scoredJobs} />
        )}

      </main>

      {/* Floating AI Assistant Trigger Widget */}
      {!isChatOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-signal text-white rounded-full shadow-2xl hover:bg-signal-hover hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 font-sans text-xs font-semibold group ring-4 ring-signal/15"
          title="Open AI Career Intelligence Assistant"
        >
          <Sparkles className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
          <span>Ask Job Radar</span>
          <span className="px-1.5 py-0.5 bg-white/20 font-mono text-[10px] font-bold rounded-full">AI</span>
        </button>
      )}

      {/* Grounded AI Chat Assistant Drawer */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenApplyModal={(j) => setActiveApplyModalJob(j)}
        getJobStatus={getJobStatus}
      />

      {/* Job Detail & Application Right Panel */}
      <JobApplyModal
        job={activeApplyModalJob}
        isOpen={Boolean(activeApplyModalJob)}
        status={activeApplyModalJob ? getJobStatus(activeApplyModalJob.id) : 'active'}
        onClose={() => setActiveApplyModalJob(null)}
        onSetStatus={(st) => {
          if (activeApplyModalJob) {
            handleSetJobStatus(activeApplyModalJob.id, st);
          }
        }}
        onToggleSave={() => {
          if (activeApplyModalJob) {
            handleToggleSaveJob(activeApplyModalJob.id);
          }
        }}
      />

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
        jobs={scoredJobs}
      />

      {/* Saved Searches Modal */}
      <SavedSearchesModal
        isOpen={isSavedSearchesOpen}
        onClose={() => setIsSavedSearchesOpen(false)}
        savedSearches={savedSearches}
        onAddSearch={handleAddSavedSearch}
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

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authPromptState.isOpen}
        onClose={() => setAuthPromptState({ isOpen: false })}
        onOpenAuth={() => navigate('/login')}
        title={authPromptState.title}
        description={authPromptState.description}
      />

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-line dark:border-line-dark py-6 text-center text-xs font-mono text-ink-muted dark:text-ink-dark-muted">
        <p>JOB RADAR INTELLIGENCE ENGINE &copy; 2026. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardView />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
