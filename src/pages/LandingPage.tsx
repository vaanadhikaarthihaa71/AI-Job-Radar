import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Zap, Star, ShieldCheck, Bookmark, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeJobs } from '../hooks/useRealtimeJobs';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { stats, jobs } = useRealtimeJobs();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const activeCount = stats.totalActiveJobs || jobs.length || 1118;

  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark flex flex-col font-sans selection:bg-signal selection:text-white transition-colors duration-200">
      
      {/* Navigation Header */}
      <header className="border-b border-line dark:border-line-dark px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 bg-paper/95 dark:bg-paper-dark/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-serif font-bold text-base flex items-center justify-center">
            JR
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-ink dark:text-ink-dark">
            JOB RADAR
          </span>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-8 bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark animate-pulse"></div>
          ) : user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark hover:bg-signal dark:hover:bg-signal text-xs font-semibold rounded-sm transition-all flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 border border-line dark:border-line-dark text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark text-xs font-semibold rounded-sm transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center space-y-16">
        
        {/* Hero Title & Subtitle */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-xs font-mono text-ink-muted dark:text-ink-dark-muted rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Live Intelligence Engine · {activeCount.toLocaleString()} Monitored</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-ink dark:text-ink-dark leading-[1.1]">
            Career intelligence that watches the market for you.
          </h1>

          <p className="text-base sm:text-xl text-ink-muted dark:text-ink-dark-muted font-sans leading-relaxed max-w-2xl mx-auto">
            Automatically discover, evaluate, and track opportunities across industries in real time.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-signal text-white font-sans text-sm font-semibold rounded-sm hover:bg-signal/90 transition-all flex items-center gap-2 shadow-lg shadow-signal/20 group"
            >
              <span>Start monitoring opportunities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 border border-line dark:border-line-dark text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark font-sans text-sm font-medium rounded-sm transition-all"
            >
              Explore how it works
            </button>
          </div>

        </div>

        {/* Feature Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl border-y border-line dark:border-line-dark py-8">
          
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="font-mono text-xs font-bold text-signal uppercase tracking-wider">
              REAL-TIME
            </div>
            <div className="font-serif text-lg font-bold text-ink dark:text-ink-dark">
              Opportunity detection
            </div>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted leading-relaxed font-sans">
              Instant radar scanning as soon as job postings go live across ATS portals.
            </p>
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="font-mono text-xs font-bold text-signal uppercase tracking-wider">
              INTELLIGENT
            </div>
            <div className="font-serif text-lg font-bold text-ink dark:text-ink-dark">
              Personalized matching
            </div>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted leading-relaxed font-sans">
              Relevancy scoring based on your skills, target industry, and remote preference.
            </p>
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="font-mono text-xs font-bold text-signal uppercase tracking-wider">
              ORGANIZED
            </div>
            <div className="font-serif text-lg font-bold text-ink dark:text-ink-dark">
              Application tracking
            </div>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted leading-relaxed font-sans">
              Pipeline tracking from saved jobs to screening, interview, and offers.
            </p>
          </div>

        </div>

        {/* Product Visual Preview */}
        <div id="how-it-works" className="w-full max-w-5xl border border-line dark:border-line-dark rounded-sm bg-paper-subtle dark:bg-paper-dark-subtle shadow-2xl overflow-hidden">
          
          {/* Mock Window Bar */}
          <div className="px-4 py-2.5 bg-paper dark:bg-paper-dark border-b border-line dark:border-line-dark flex items-center justify-between font-mono text-xs text-ink-muted dark:text-ink-dark-muted">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-signal"></span>
              <span className="font-semibold text-ink dark:text-ink-dark">Job Radar Intelligence Feed</span>
            </div>
            <div>● Live monitoring</div>
          </div>

          {/* Mock Rows Preview */}
          <div className="p-4 sm:p-6 space-y-3 bg-paper dark:bg-paper-dark font-sans">
            
            <div className="p-4 border border-line dark:border-line-dark rounded-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-base text-ink dark:text-ink-dark">
                  Senior Machine Learning Engineer
                </div>
                <div className="text-xs text-ink-muted dark:text-ink-dark-muted flex items-center gap-2 font-sans">
                  <span>Acme Technologies</span> · <span>Remote · India</span> · <span className="font-mono">Posted 18 min ago</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <span className="px-2 py-0.5 bg-paper-subtle dark:bg-paper-dark-subtle text-[11px] font-mono border border-line dark:border-line-dark">Python</span>
                  <span className="px-2 py-0.5 bg-paper-subtle dark:bg-paper-dark-subtle text-[11px] font-mono border border-line dark:border-line-dark">PyTorch</span>
                  <span className="px-2 py-0.5 bg-paper-subtle dark:bg-paper-dark-subtle text-[11px] font-mono border border-line dark:border-line-dark">SQL</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 rounded-sm">
                  92 MATCH
                </div>
              </div>
            </div>

            <div className="p-4 border border-line dark:border-line-dark rounded-sm flex items-center justify-between gap-4 opacity-80">
              <div className="space-y-1">
                <div className="font-semibold text-base text-ink dark:text-ink-dark">
                  Full Stack Engineer (TypeScript / React)
                </div>
                <div className="text-xs text-ink-muted dark:text-ink-dark-muted flex items-center gap-2 font-sans">
                  <span>Stripe</span> · <span>Remote</span> · <span className="font-mono">Posted 42 min ago</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <span className="px-2 py-0.5 bg-paper-subtle dark:bg-paper-dark-subtle text-[11px] font-mono border border-line dark:border-line-dark">React</span>
                  <span className="px-2 py-0.5 bg-paper-subtle dark:bg-paper-dark-subtle text-[11px] font-mono border border-line dark:border-line-dark">Node.js</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 rounded-sm">
                  88 MATCH
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-line dark:border-line-dark py-6 text-center text-xs font-mono text-ink-muted dark:text-ink-dark-muted">
        <p>JOB RADAR INTELLIGENCE BRIEFING &copy; 2026. ALL RIGHTS RESERVED.</p>
      </footer>

    </div>
  );
};
