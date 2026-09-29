import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export type JobStatus = 'active' | 'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hidden';

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

const getStorageKey = (sub?: string) => (sub ? `job_radar_statuses_${sub}` : 'job_radar_statuses_public');
const getSearchesKey = (sub?: string) => (sub ? `job_radar_searches_${sub}` : 'job_radar_searches_public');

export function useJobStatus() {
  const { user } = useAuth();
  const userId = user?.id;

  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Load user-specific job statuses & saved searches whenever userId changes
  useEffect(() => {
    const key = getStorageKey(userId);
    try {
      const stored = localStorage.getItem(key);
      setJobStatuses(stored ? JSON.parse(stored) : {});
    } catch (e) {
      console.error('Error reading user job statuses from localStorage:', e);
      setJobStatuses({});
    }

    const searchKey = getSearchesKey(userId);
    try {
      const storedSearches = localStorage.getItem(searchKey);
      setSavedSearches(storedSearches ? JSON.parse(storedSearches) : []);
    } catch (e) {
      console.error('Error reading user saved searches from localStorage:', e);
      setSavedSearches([]);
    }
  }, [userId]);

  // Sync statuses to user-specific localStorage key
  useEffect(() => {
    const key = getStorageKey(userId);
    try {
      localStorage.setItem(key, JSON.stringify(jobStatuses));
    } catch (e) {
      console.error('Error writing job statuses to localStorage:', e);
    }
  }, [jobStatuses, userId]);

  // Sync saved searches to user-specific localStorage key
  useEffect(() => {
    const searchKey = getSearchesKey(userId);
    try {
      localStorage.setItem(searchKey, JSON.stringify(savedSearches));
    } catch (e) {
      console.error('Error writing saved searches to localStorage:', e);
    }
  }, [savedSearches, userId]);

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
