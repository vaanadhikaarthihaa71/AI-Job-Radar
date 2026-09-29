import React from 'react';
import { X, Lock, ShieldCheck, User } from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  title?: string;
  description?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  title = 'Sign In Required',
  description = 'Sign in or register an account to save jobs, track applications, save custom searches, and use the AI assistant.',
}) => {
  if (!isOpen) return null;

  const handleSignInClick = () => {
    onClose();
    onOpenAuth();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-paper dark:bg-paper-dark border border-line dark:border-line-dark shadow-2xl p-6 relative font-mono text-ink dark:text-ink-dark space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Masthead */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-signal/10 text-signal border border-signal/30 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-mono tracking-tight uppercase">
            {title}
          </h2>
          <p className="text-xs font-sans text-ink-muted dark:text-ink-dark-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Gated feature highlights */}
        <div className="p-3 bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark text-xs space-y-2 font-sans">
          <div className="flex items-center gap-2 font-mono font-bold text-signal text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED FEATURES UNLOCKED:</span>
          </div>
          <ul className="space-y-1 text-ink-muted dark:text-ink-dark-muted text-[11px] list-disc list-inside">
            <li>Save & bookmark listings across sessions</li>
            <li>Track application statuses & history</li>
            <li>Grounded AI Job Search Assistant</li>
            <li>Per-user saved preferences</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSignInClick}
            className="w-full py-3.5 bg-signal text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-signal/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-signal/20"
          >
            <User className="w-4 h-4" />
            <span>CONTINUE TO SIGN IN / REGISTER</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2 text-center text-xs font-mono text-ink-muted dark:text-ink-dark-muted hover:underline"
          >
            CANCEL & CONTINUE BROWSING
          </button>
        </div>

      </div>
    </div>
  );
};
