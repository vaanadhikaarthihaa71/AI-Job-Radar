import { useState, useEffect, useCallback } from 'react';

export type JobStatus = 'active' | 'saved' | 'applied' | 'hidden';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  source: string;
  remoteOnly: boolean;
  minScore: number;
  notify: boolean;
  createdAt: string;
}

const JOB_STATUSES_KEY = 'job_radar_statuses_v1';
const SAVED_SEARCHES_KEY = 'job_radar_saved_searches_v1';

export function useJobStatus() {
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>(() => {
    try {
      const stored = localStorage.getItem(JOB_STATUSES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error loading job statuses from localStorage:', e);
      return {};
    }
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading saved searches from localStorage:', e);
      return [];
    }
  });

  // Sync statuses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(JOB_STATUSES_KEY, JSON.stringify(jobStatuses));
    } catch (e) {
      console.error('Error writing job statuses to localStorage:', e);
    }
  }, [jobStatuses]);

  // Sync saved searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
    } catch (e) {
      console.error('Error writing saved searches to localStorage:', e);
    }
  }, [savedSearches]);

  const setJobStatus = useCallback((jobId: string, status: JobStatus) => {
    setJobStatuses((prev) => {
      const next = { ...prev };
      if (status === 'active') {
        delete next[jobId];
      } else {
        next[jobId] = status;
      }
      return next;
    });
  }, []);

  const toggleSaveJob = useCallback((jobId: string) => {
    setJobStatuses((prev) => {
      const current = prev[jobId];
      const next = { ...prev };
      if (current === 'saved') {
        delete next[jobId];
      } else {
        next[jobId] = 'saved';
      }
      return next;
    });
  }, []);

  const addSavedSearch = useCallback((search: Omit<SavedSearch, 'id' | 'createdAt'>) => {
    const newSearch: SavedSearch = {
      ...search,
      id: 'search_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setSavedSearches((prev) => [newSearch, ...prev]);

    // Request notification permission if user enabled notifications
    if (search.notify && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const deleteSavedSearch = useCallback((id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getJobStatus = useCallback(
    (jobId: string): JobStatus => {
      return jobStatuses[jobId] || 'active';
    },
    [jobStatuses]
  );

  return {
    jobStatuses,
    savedSearches,
    setJobStatus,
    toggleSaveJob,
    getJobStatus,
    addSavedSearch,
    deleteSavedSearch,
  };
}
