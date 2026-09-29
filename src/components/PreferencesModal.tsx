import React, { useState } from 'react';
import { X, Check, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types/job';
import { INDUSTRY_CATEGORIES } from '../constants/industries';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    userProfile?.industries?.length ? userProfile.industries : ['tech', 'healthcare', 'finance']
  );
  const [remoteOnly, setRemoteOnly] = useState<boolean>(userProfile?.remoteOnly || false);
  const [experienceLevel, setExperienceLevel] = useState<string>(
    userProfile?.experienceLevel || 'All Levels'
  );

  const toggleIndustry = (id: string) => {
    if (selectedIndustries.includes(id)) {
      if (selectedIndustries.length > 1) {
        setSelectedIndustries(selectedIndustries.filter((i) => i !== id));
      }
    } else {
      setSelectedIndustries([...selectedIndustries, id]);
    }
  };

  const handleSave = () => {
    const updated: UserProfile = {
      name: userProfile?.name || 'Vaanadhi',
      email: userProfile?.email || 'vaanadhi@jobradar.io',
      skills: userProfile?.skills || [],
      industries: selectedIndustries,
      experienceLevel,
      remoteOnly,
      minScore: userProfile?.minScore || 0,
      isAuthenticated: true,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      
      <div className="w-full max-w-xl bg-paper dark:bg-paper-dark border border-line dark:border-line-dark shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-line dark:border-line-dark flex items-center justify-between bg-paper-subtle dark:bg-paper-dark-subtle">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-signal" />
            <h3 className="font-serif text-lg font-bold text-ink dark:text-ink-dark">
              Your Career Focus & Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Target Industries */}
          <div className="space-y-3">
            <label className="font-mono font-semibold uppercase text-ink-muted dark:text-ink-dark-muted block">
              TARGET INDUSTRIES
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INDUSTRY_CATEGORIES.map((ind) => {
                const isSelected = selectedIndustries.includes(ind.id);
                return (
                  <button
                    key={ind.id}
                    onClick={() => toggleIndustry(ind.id)}
                    className={`p-3 border text-left rounded-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-signal bg-signal/10 text-signal font-semibold'
                        : 'border-line dark:border-line-dark bg-paper-subtle/50 dark:bg-paper-dark-subtle/50 text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark'
                    }`}
                  >
                    <span>{ind.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-signal" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remote Preference */}
          <div className="p-4 border border-line dark:border-line-dark bg-paper-subtle/50 dark:bg-paper-dark-subtle/50 rounded-sm flex items-center justify-between">
            <div>
              <div className="font-semibold text-ink dark:text-ink-dark text-sm">
                Remote Positions Preference
              </div>
              <div className="text-[11px] text-ink-muted dark:text-ink-dark-muted">
                Prioritize remote work opportunities in job feeds and match scoring.
              </div>
            </div>
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-4 h-4 accent-signal cursor-pointer"
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="font-mono font-semibold uppercase text-ink-muted dark:text-ink-dark-muted block">
              TARGET EXPERIENCE LEVEL
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full p-2.5 bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark text-ink dark:text-ink-dark rounded-sm focus:outline-none focus:border-signal"
            >
              <option value="All Levels">All Experience Levels</option>
              <option value="Entry Level">Entry Level (0-2 Yrs)</option>
              <option value="Mid Level">Mid Level (3-5 Yrs)</option>
              <option value="Senior">Senior / Principal (5+ Yrs)</option>
              <option value="Executive">Lead / Director / Executive</option>
            </select>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-line dark:border-line-dark text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark text-xs font-medium rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-signal text-white text-xs font-semibold rounded-sm hover:bg-signal/90 transition-all flex items-center gap-1.5"
          >
            <span>Save Focus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
