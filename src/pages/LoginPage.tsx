import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        const res = await signUpWithEmail(name, email, password);
        if (!res.success) {
          setAuthError(res.error || 'Failed to register account.');
        } else {
          navigate('/dashboard');
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setAuthError(res.error || 'Failed to sign in. Check your credentials.');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark flex font-sans selection:bg-signal selection:text-white transition-colors duration-200">
      
      {/* Left Column: Branding & Tagline */}
      <div className="hidden md:flex md:w-1/2 bg-paper-subtle dark:bg-paper-dark-subtle border-r border-line dark:border-line-dark p-12 flex-col justify-between">
        
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-sm bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-serif font-bold text-base flex items-center justify-center">
            JR
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-ink dark:text-ink-dark">
            JOB RADAR
          </span>
        </button>

        {/* Hero Pitch */}
        <div className="space-y-6 max-w-md">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold tracking-tight text-ink dark:text-ink-dark leading-tight">
            Your career intelligence layer.
          </h1>
          <p className="text-sm text-ink-muted dark:text-ink-dark-muted font-sans leading-relaxed">
            Continuously watches the market, evaluates opportunities, and helps you make fast career decisions.
          </p>

          <div className="space-y-3 pt-2 font-sans text-xs text-ink/80 dark:text-ink-dark/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time ATS job detection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Intelligent skill & relevancy scoring</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Personalized application tracking</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs font-mono text-ink-muted dark:text-ink-dark-muted">
          &copy; 2026 JOB RADAR INTELLIGENCE ENGINE
        </div>

      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full md:w-1/2 p-6 sm:p-12 flex flex-col justify-center max-w-lg mx-auto">
        
        {/* Mobile Header Branding */}
        <div className="md:hidden mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark font-serif font-bold text-sm flex items-center justify-center">
              JR
            </div>
            <span className="font-serif text-lg font-bold text-ink dark:text-ink-dark">
              JOB RADAR
            </span>
          </button>
        </div>

        <div className="space-y-6">
          
          <div>
            <h2 className="text-2xl font-serif font-bold text-ink dark:text-ink-dark">
              {authMode === 'signin' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted font-sans mt-1">
              Enter your credentials to access your career dashboard.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4 font-sans text-xs">
            {authMode === 'signup' && (
              <div>
                <label className="block text-ink-muted dark:text-ink-dark-muted mb-1 font-mono font-semibold uppercase text-[11px]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaanadhi Kaarthihaa"
                  className="w-full px-3 py-2.5 bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark text-ink dark:text-ink-dark rounded-sm focus:outline-none focus:border-signal text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-ink-muted dark:text-ink-dark-muted mb-1 font-mono font-semibold uppercase text-[11px]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark text-ink dark:text-ink-dark rounded-sm focus:outline-none focus:border-signal text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-ink-muted dark:text-ink-dark-muted font-mono font-semibold uppercase text-[11px]">
                  Password
                </label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset email sent to your registered address.')}
                    className="text-[11px] font-sans text-ink-muted dark:text-ink-dark-muted hover:text-signal"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark text-ink dark:text-ink-dark rounded-sm focus:outline-none focus:border-signal text-sm"
              />
            </div>

            {authError && (
              <div className="p-3 border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-signal text-white font-sans text-xs font-semibold rounded-sm hover:bg-signal/90 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign in' : 'Create account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign In / Create Account */}
          <div className="text-center text-xs font-sans text-ink-muted dark:text-ink-dark-muted pt-2 border-t border-line dark:border-line-dark">
            {authMode === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                  }}
                  className="font-semibold text-ink dark:text-ink-dark hover:text-signal"
                >
                  Create account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                  }}
                  className="font-semibold text-ink dark:text-ink-dark hover:text-signal"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
