import { useEffect, useState, useCallback } from 'react';
import { Job } from '../types/job';

interface UseKeyboardNavProps {
  jobs: Job[];
  onToggleSaveJob: (jobId: string) => void;
  enabled?: boolean;
}

export function useKeyboardNav({ jobs, onToggleSaveJob, enabled = true }: UseKeyboardNavProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Reset index when jobs change significantly
  useEffect(() => {
    if (selectedIndex >= jobs.length) {
      setSelectedIndex(jobs.length - 1);
    }
  }, [jobs.length, selectedIndex]);

  const selectedJob = selectedIndex >= 0 && selectedIndex < jobs.length ? jobs[selectedIndex] : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || jobs.length === 0) return;

      // Ignore if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 'j': move down
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev + 1;
          return next < jobs.length ? next : prev;
        });
      }

      // 'k': move up
      else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev - 1;
          return next >= 0 ? next : 0;
        });
      }

      // 'o': open link in new tab
      else if (e.key === 'o' || e.key === 'O') {
        if (selectedJob && selectedJob.job_url) {
          e.preventDefault();
          window.open(selectedJob.job_url, '_blank', 'noopener,noreferrer');
        }
      }

      // 's': toggle save
      else if (e.key === 's' || e.key === 'S') {
        if (selectedJob) {
          e.preventDefault();
          onToggleSaveJob(selectedJob.id);
        }
      }
    },
    [enabled, jobs, selectedJob, onToggleSaveJob]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    selectedIndex,
    selectedJob,
    setSelectedIndex,
  };
}
