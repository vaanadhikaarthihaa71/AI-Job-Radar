import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';
import { Job } from '../types/job';

interface IntelligenceCenterProps {
  jobs: Job[];
}

export const IntelligenceCenter: React.FC<IntelligenceCenterProps> = ({ jobs }) => {
  const skillCounts = jobs.reduce((acc, job) => {
    if (job.matched_skills) {
      job.matched_skills.forEach((skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxSkillCount = sortedSkills[0]?.[1] || 1;

  const marketTrends = [
    { skill: 'Machine Learning', growth: '18%', positive: true, volume: 'High Demand' },
    { skill: 'Python', growth: '12%', positive: true, volume: 'Dominant Tech' },
    { skill: 'React / Next.js', growth: '7%', positive: true, volume: 'Frontend Core' },
    { skill: 'Data Engineering', growth: '4%', positive: true, volume: 'Infrastructure' },
    { skill: 'Kubernetes / DevOps', growth: '3%', positive: true, volume: 'Cloud Ops' },
  ];

  const remoteCount = jobs.filter((j) => j.is_remote).length;
  const highMatchCount = jobs.filter((j) => j.score >= 80).length;

  return (
    <div className="py-6 space-y-8 animate-fade-in font-sans">
      
      {/* Editorial Major Page Heading (DM Serif Display) */}
      <div className="pb-4 border-b border-line dark:border-line-dark">
        <h2 className="text-3xl sm:text-4xl font-serif font-normal text-ink dark:text-ink-dark tracking-tight">
          Career Market Intelligence
        </h2>
        <p className="text-sm text-ink-muted dark:text-ink-dark-muted font-sans mt-1.5">
          Real-time analysis of skill demand, industry velocity, and personalized opportunity trends.
        </p>
      </div>

      {/* Grid Row 1: Skill Velocity & Frequency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Skill Velocity */}
        <div className="p-5 border border-line dark:border-line-dark bg-paper-surface dark:bg-paper-dark-surface rounded-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line dark:border-line-dark">
            <h3 className="font-sans text-base font-semibold text-ink dark:text-ink-dark flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-state-success" />
              <span>Skill Demand Velocity</span>
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
              THIS WEEK
            </span>
          </div>

          <div className="space-y-3 font-sans">
            {marketTrends.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1">
                <div className="space-y-0.5">
                  <div className="font-semibold text-ink dark:text-ink-dark">{t.skill}</div>
                  <div className="text-[11px] font-mono text-ink-muted dark:text-ink-dark-muted">
                    {t.volume}
                  </div>
                </div>
                <div className="font-mono font-bold text-state-success flex items-center gap-1">
                  <span>↑ {t.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monitored Skill Frequency */}
        <div className="p-5 border border-line dark:border-line-dark bg-paper-surface dark:bg-paper-dark-surface rounded-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line dark:border-line-dark">
            <h3 className="font-sans text-base font-semibold text-ink dark:text-ink-dark flex items-center gap-2">
              <Zap className="w-4 h-4 text-signal" />
              <span>Monitored Skill Frequency</span>
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
              LIVE DATA
            </span>
          </div>

          <div className="space-y-3 font-sans">
            {sortedSkills.map(([skill, count], i) => {
              const percent = Math.round((count / maxSkillCount) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-ink dark:text-ink-dark">{skill}</span>
                    <span className="font-mono text-ink-muted dark:text-ink-dark-muted">{count} jobs</span>
                  </div>
                  <div className="w-full h-1.5 bg-paper dark:bg-paper-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-signal rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid Row 2: Highlights */}
      <div className="p-5 border border-line dark:border-line-dark bg-paper-surface dark:bg-paper-dark-surface rounded-sm space-y-4">
        <h3 className="font-sans text-base font-semibold text-ink dark:text-ink-dark">
          Market Intelligence Highlights
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
          <div className="p-4 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark rounded-sm space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
              REMOTE RATIO
            </div>
            <div className="text-2xl font-bold text-ink dark:text-ink-dark">
              {jobs.length > 0 ? Math.round((remoteCount / jobs.length) * 100) : 0}%
            </div>
            <p className="text-[11px] font-sans text-ink-muted dark:text-ink-dark-muted">
              {remoteCount} of {jobs.length} opportunities offer remote flexibility.
            </p>
          </div>

          <div className="p-4 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark rounded-sm space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
              HIGH ALIGNMENT DENSITY
            </div>
            <div className="text-2xl font-bold text-state-success">
              {highMatchCount}
            </div>
            <p className="text-[11px] font-sans text-ink-muted dark:text-ink-dark-muted">
              Opportunities matching &gt;80% of your career focus skills.
            </p>
          </div>

          <div className="p-4 bg-paper dark:bg-paper-dark border border-line dark:border-line-dark rounded-sm space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-ink-dark-muted">
              MONITORED SOURCES
            </div>
            <div className="text-2xl font-bold text-signal">
              8 Portals
            </div>
            <p className="text-[11px] font-sans text-ink-muted dark:text-ink-dark-muted">
              Greenhouse, Lever, Ashby, Indeed, LinkedIn & Direct ATS.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
