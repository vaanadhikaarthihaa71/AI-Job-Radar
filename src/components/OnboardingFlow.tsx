import React, { useState } from 'react';
import {
  Radar,
  Zap,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  User,
  Lock,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types/job';
import { INDUSTRY_CATEGORIES } from '../constants/industries';
import { useAuth } from '../context/AuthContext';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, initialProfile }) => {
  const { signInWithEmail, signUpWithEmail, user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState(initialProfile?.name || user?.name || '');
  const [email, setEmail] = useState(initialProfile?.email || user?.email || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Target Industry State
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    initialProfile?.industries?.length ? initialProfile.industries : ['tech', 'healthcare', 'finance']
  );
  const [experienceLevel, setExperienceLevel] = useState<string>(
    initialProfile?.experienceLevel || 'All Levels'
  );
  const [remoteOnly, setRemoteOnly] = useState<boolean>(initialProfile?.remoteOnly || false);

  // Email & Password Submit Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const res = await signUpWithEmail(name, email, password);
        if (!res.success) {
          setAuthError(res.error || 'Failed to create account.');
        } else {
          setStep(3);
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setAuthError(res.error || 'Failed to sign in. Check your credentials.');
        } else {
          setStep(3);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIndustry = (id: string) => {
    if (selectedIndustries.includes(id)) {
      if (selectedIndustries.length > 1) {
        setSelectedIndustries(selectedIndustries.filter((i) => i !== id));
      }
    } else {
      setSelectedIndustries([...selectedIndustries, id]);
    }
  };

  const handleFinalSubmit = () => {
    const profileName = user?.name || name.trim() || email.split('@')[0] || 'Verified User';
    const profileEmail = user?.email || email.trim() || 'user@jobradar.io';

    const profile: UserProfile = {
      name: profileName,
      email: profileEmail,
      skills: [],
      industries: selectedIndustries,
      experienceLevel,
      remoteOnly,
      minScore: 0,
      isAuthenticated: true,
    };
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark flex flex-col overflow-y-auto selection:bg-signal selection:text-white">
      
      {/* Top Header Progress Bar */}
      <header className="border-b border-line dark:border-line-dark px-6 py-4 flex items-center justify-between sticky top-0 bg-paper/90 dark:bg-paper-dark/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-signal/10 border border-signal flex items-center justify-center animate-pulse">
            <Radar className="w-4 h-4 text-signal" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-wider uppercase text-ink dark:text-ink-dark">
              JOB RADAR <span className="text-signal">// AUTH & SETUP</span>
            </h1>
            <p className="text-[11px] font-mono text-ink-muted dark:text-ink-dark-muted">
              Realtime Multi-Industry Intelligence
            </p>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div
            className={`px-3 py-1 border transition-all ${
              step === 1
                ? 'border-signal bg-signal/10 text-signal font-bold'
                : step > 1
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold'
                : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted'
            }`}
          >
            1. OVERVIEW
          </div>
          <span className="text-ink-muted dark:text-ink-dark-muted">→</span>
          <div
            className={`px-3 py-1 border transition-all ${
              step === 2
                ? 'border-signal bg-signal/10 text-signal font-bold'
                : step > 2
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold'
                : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted'
            }`}
          >
            2. AUTHENTICATE
          </div>
          <span className="text-ink-muted dark:text-ink-dark-muted">→</span>
          <div
            className={`px-3 py-1 border transition-all ${
              step === 3
                ? 'border-signal bg-signal/10 text-signal font-bold'
                : 'border-line dark:border-line-dark text-ink-muted dark:text-ink-dark-muted'
            }`}
          >
            3. TARGET INDUSTRY
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center">
        
        {/* ================= STEP 1: HERO LANDING (PAGE 1) ================= */}
        {step === 1 && (
          <div className="w-full space-y-8 animate-fadeIn text-center">
            
            {/* Pulsing Radar Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-signal/30 bg-signal/10 text-signal font-mono text-xs tracking-widest uppercase">
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              <span>LIVE AI CRAWLER ENGINE ACTIVE</span>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-ink dark:text-ink-dark leading-tight">
                Never Miss a New Job Posting Across <span className="text-signal underline decoration-signal/40 underline-offset-8">Any Industry</span>.
              </h2>
              <p className="text-base md:text-lg text-ink-muted dark:text-ink-dark-muted font-sans leading-relaxed">
                Job Radar monitors top job platforms, career boards, and direct ATS portals 24/7. 
                Whether you work in <strong>Tech, Healthcare, Finance, Marketing, Skilled Trades, Design, or Education</strong>, get instant alerts and direct external site application traversal.
              </p>
            </div>

            {/* Metrics & Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto font-mono">
              <div className="p-5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle space-y-2">
                <div className="text-xs text-ink-muted dark:text-ink-dark-muted uppercase">REALTIME SPEED</div>
                <div className="text-2xl font-bold text-signal flex items-center gap-2">
                  <Zap className="w-5 h-5" /> &lt; 1 MIN DELAY
                </div>
                <p className="text-xs text-ink-muted dark:text-ink-dark-muted">
                  Instant radar detection as soon as postings go live.
                </p>
              </div>

              <div className="p-5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle space-y-2">
                <div className="text-xs text-ink-muted dark:text-ink-dark-muted uppercase">COVERAGE</div>
                <div className="text-2xl font-bold text-ink dark:text-ink-dark flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-signal" /> ALL INDUSTRIES
                </div>
                <p className="text-xs text-ink-muted dark:text-ink-dark-muted">
                  From Nursing & Finance to Software Engineering & Trades.
                </p>
              </div>

              <div className="p-5 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle space-y-2">
                <div className="text-xs text-ink-muted dark:text-ink-dark-muted uppercase">AUTHENTICATION</div>
                <div className="text-2xl font-bold text-ink dark:text-ink-dark flex items-center gap-2">
                  <Lock className="w-5 h-5 text-signal" /> SECURE AUTH
                </div>
                <p className="text-xs text-ink-muted dark:text-ink-dark-muted">
                  Sign in or create account with Email & Password.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-signal text-white font-mono text-sm uppercase tracking-wider font-bold hover:bg-signal/90 transition-all flex items-center gap-3 shadow-lg shadow-signal/20 group"
              >
                <span>CONTINUE TO SIGN IN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 2: LOGIN / REGISTER PAGE (PAGE 2) ================= */}
        {step === 2 && (
          <div className="w-full max-w-md space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-signal/10 text-signal mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-sans font-bold text-ink dark:text-ink-dark">
                Authentication System
              </h2>
              <p className="text-xs font-mono text-ink-muted dark:text-ink-dark-muted">
                Enter your email address and password to sign in or create a new account.
              </p>
            </div>

            {/* Auth Mode Tabs */}
            <div className="flex border border-line dark:border-line-dark font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 text-center font-bold transition-colors ${
                  authMode === 'signin'
                    ? 'bg-signal text-white'
                    : 'bg-paper-subtle dark:bg-paper-dark-subtle text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 text-center font-bold transition-colors ${
                  authMode === 'signup'
                    ? 'bg-signal text-white'
                    : 'bg-paper-subtle dark:bg-paper-dark-subtle text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark'
                }`}
              >
                REGISTER ACCOUNT
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 font-mono text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-ink-muted dark:text-ink-dark-muted mb-1 font-bold uppercase">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-ink-muted dark:text-ink-dark-muted" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full pl-9 pr-3 py-2.5 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark text-ink dark:text-ink-dark focus:outline-none focus:border-signal"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-ink-muted dark:text-ink-dark-muted mb-1 font-bold uppercase">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-muted dark:text-ink-dark-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark text-ink dark:text-ink-dark focus:outline-none focus:border-signal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-muted dark:text-ink-dark-muted mb-1 font-bold uppercase">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-muted dark:text-ink-dark-muted" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark text-ink dark:text-ink-dark focus:outline-none focus:border-signal"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-2.5 border border-red-500/50 bg-red-500/10 text-red-500 text-xs font-mono">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-signal text-white font-bold uppercase tracking-wider hover:bg-signal/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'SIGN IN & NEXT' : 'CREATE ACCOUNT & NEXT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 3: TARGET INDUSTRY SELECTION (PAGE 3 PRE-LAUNCH) ================= */}
        {step === 3 && (
          <div className="w-full space-y-8 animate-fadeIn">
            
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex p-3 rounded-full bg-signal/10 text-signal mb-1">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-ink dark:text-ink-dark">
                Select Your Target Industry
              </h2>
              <p className="text-xs font-mono text-ink-muted dark:text-ink-dark-muted">
                Choose the industry domain(s) you want Job Radar to monitor. You can select one or multiple industries.
              </p>
            </div>

            {/* Target Industry Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase text-ink-muted dark:text-ink-dark-muted tracking-wider text-center">
                CHOOSE TARGET INDUSTRY CATEGORIES:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {INDUSTRY_CATEGORIES.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustries.includes(ind.id);
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => toggleIndustry(ind.id)}
                      className={`p-4 border text-left flex flex-col justify-between transition-all group ${
                        isSelected
                          ? 'border-signal bg-signal/10 text-signal shadow-md font-semibold scale-[1.01]'
                          : 'border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-none border border-line dark:border-line-dark bg-paper dark:bg-paper-dark`}>
                            <Icon className={`w-6 h-6 ${ind.color}`} />
                          </div>
                          {isSelected ? (
                            <span className="px-2 py-0.5 bg-signal text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> SELECTED
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-ink-muted dark:text-ink-dark-muted uppercase group-hover:text-ink dark:group-hover:text-ink-dark">
                              + SELECT
                            </span>
                          )}
                        </div>
                        <h3 className="font-mono text-sm font-bold text-ink dark:text-ink-dark mb-1">
                          {ind.label}
                        </h3>
                        <p className="text-xs text-ink-muted dark:text-ink-dark-muted font-sans leading-relaxed">
                          {ind.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Mode & Experience Level Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle space-y-2">
                <label className="block font-bold uppercase text-ink-muted dark:text-ink-dark-muted">
                  TARGET EXPERIENCE LEVEL:
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark text-ink dark:text-ink-dark focus:outline-none focus:border-signal"
                >
                  <option value="All Levels">All Experience Levels</option>
                  <option value="Entry Level">Entry Level (0-2 Yrs)</option>
                  <option value="Mid Level">Mid Level (3-5 Yrs)</option>
                  <option value="Senior">Senior / Principal (5+ Yrs)</option>
                  <option value="Executive">Lead / Director / Executive</option>
                </select>
              </div>

              <div className="p-4 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle space-y-2 flex items-center justify-between">
                <div>
                  <label className="block font-bold uppercase text-ink dark:text-ink-dark">
                    REMOTE POSITIONS ONLY
                  </label>
                  <p className="text-[11px] text-ink-muted dark:text-ink-dark-muted">
                    Filter out physical on-site roles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    remoteOnly ? 'bg-signal' : 'bg-line dark:bg-line-dark'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      remoteOnly ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={handleFinalSubmit}
                className="px-10 py-4 bg-signal text-white font-mono text-sm uppercase tracking-wider font-bold hover:bg-signal/90 transition-all flex items-center gap-3 shadow-xl shadow-signal/30 group"
              >
                <Radar className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>ENTER JOB RADAR DASHBOARD</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
