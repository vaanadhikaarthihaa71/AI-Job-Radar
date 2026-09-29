import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Job, ConnectionState, DashboardStats } from '../types/job';

// Helper to get effective date timestamp for sorting (posted_at -> falling back to detected_at)
export const getEffectiveTimestamp = (j: Job): number => {
  if (j.posted_at) {
    const pTime = new Date(j.posted_at).getTime();
    if (!isNaN(pTime) && pTime > 0) return pTime;
  }
  if (j.detected_at) {
    const dTime = new Date(j.detected_at).getTime();
    if (!isNaN(dTime) && dTime > 0) return dTime;
  }
  return 0;
};

export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bufferedJobs, setBufferedJobs] = useState<Job[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    isSupabaseConfigured ? 'disconnected' : 'polling'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nextScanInSeconds, setNextScanInSeconds] = useState<number>(90);
  const [stats, setStats] = useState<DashboardStats>({
    jobsLastHour: 0,
    medianDelayMinutes: null,
    totalActiveJobs: 0,
  });

  const lastSeenDetectedAtRef = useRef<string | null>(null);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef<number>(0);

  // Next scan countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNextScanInSeconds((prev) => (prev > 1 ? prev - 1 : 90));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate live statistics
  const updateStats = useCallback((jobList: Job[]) => {
    const now = new Date().getTime();
    const oneHourAgo = now - 60 * 60 * 1000;

    const lastHourCount = jobList.filter(
      (j) => new Date(j.detected_at).getTime() >= oneHourAgo
    ).length;

    const delaysInMinutes: number[] = [];
    jobList.forEach((j) => {
      if (j.posted_at) {
        const posted = new Date(j.posted_at).getTime();
        const detected = new Date(j.detected_at).getTime();
        if (!isNaN(posted) && !isNaN(detected) && detected >= posted) {
          const diffMinutes = Math.round((detected - posted) / (1000 * 60));
          delaysInMinutes.push(diffMinutes);
        }
      }
    });

    let medianDelay: number | null = null;
    if (delaysInMinutes.length > 0) {
      delaysInMinutes.sort((a, b) => a - b);
      const mid = Math.floor(delaysInMinutes.length / 2);
      medianDelay =
        delaysInMinutes.length % 2 !== 0
          ? delaysInMinutes[mid]
          : Math.round((delaysInMinutes[mid - 1] + delaysInMinutes[mid]) / 2);
    }

    setStats({
      jobsLastHour: lastHourCount,
      medianDelayMinutes: medianDelay,
      totalActiveJobs: jobList.length,
    });
  }, []);

  // Local API Fallback fetch
  const fetchLocalJobsFallback = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data: Job[] = await res.json();
        if (data && data.length > 0) {
          const sorted = [...data].sort((a, b) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));
          setJobs(sorted);
          setErrorMessage(null);
          setConnectionState('polling');
          if (sorted[0]?.detected_at) {
            lastSeenDetectedAtRef.current = sorted[0].detected_at;
          }
          updateStats(sorted);
          return true;
        }
      }
    } catch (err: any) {
      console.warn('[Local API Fallback Warning]:', err);
    }
    return false;
  }, [updateStats]);

  // Primary jobs fetcher (Supabase -> Local Fallback)
  const fetchJobs = useCallback(async () => {
    if (!isSupabaseConfigured) {
      await fetchLocalJobsFallback();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(500);

      if (error || !data || data.length === 0) {
        // Quietly fallback to local API endpoint without showing scary error banner
        const loadedFallback = await fetchLocalJobsFallback();
        if (!loadedFallback) {
          setErrorMessage('No job rows available. Click "Run Live AI Scanner" to ingest postings.');
        }
      } else {
        const sorted = [...data].sort((a, b) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));
        setJobs(sorted);
        setErrorMessage(null);
        setConnectionState('connected');
        lastSeenDetectedAtRef.current = data[0].detected_at;
        updateStats(sorted);
      }
    } catch (err: any) {
      const loadedFallback = await fetchLocalJobsFallback();
      if (!loadedFallback) {
        setErrorMessage('Unable to connect to database stream.');
      }
    }
  }, [updateStats, fetchLocalJobsFallback]);

  // Start quiet 15-second polling loop
  const startPollingFallback = useCallback(() => {
    if (pollingTimerRef.current) return;
    pollingTimerRef.current = setInterval(() => {
      fetchJobs();
    }, 15000);
  }, [fetchJobs]);

  // Stop polling loop
  const stopPollingFallback = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Realtime subscription setup ONLY if Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Run quiet local polling loop
      startPollingFallback();
      return () => stopPollingFallback();
    }

    let channel: any = null;

    function setupSubscription() {
      channel = supabase
        .channel('public:jobs_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'jobs' },
          (payload) => {
            const newJob = { ...(payload.new as Job), isNew: true };
            lastSeenDetectedAtRef.current = newJob.detected_at;

            if (isPausedRef.current) {
              setBufferedJobs((prev) => [newJob, ...prev]);
            } else {
              setJobs((prev) => {
                const updated = [newJob, ...prev];
                const sorted = Array.from(new Map(updated.map((item) => [item.id, item])).values());
                sorted.sort((a, b) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));
                updateStats(sorted);
                return sorted;
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionState('connected');
            setErrorMessage(null);
            reconnectAttemptRef.current = 0;
            stopPollingFallback();
          } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setConnectionState('polling');
            startPollingFallback();

            if (!reconnectTimeoutRef.current) {
              reconnectAttemptRef.current += 1;
              const delay = Math.min(5000 * Math.pow(2, reconnectAttemptRef.current - 1), 60000);
              reconnectTimeoutRef.current = setTimeout(() => {
                reconnectTimeoutRef.current = null;
                if (channel) {
                  supabase.removeChannel(channel);
                }
                setupSubscription();
              }, delay);
            }
          }
        });
    }

    setupSubscription();

    return () => {
      stopPollingFallback();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchJobs, updateStats, startPollingFallback, stopPollingFallback]);

  const flushBuffer = useCallback(() => {
    if (bufferedJobs.length === 0) return;
    setJobs((prev) => {
      const combined = [...bufferedJobs, ...prev];
      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
      unique.sort((a, b) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));
      updateStats(unique);
      return unique;
    });
    setBufferedJobs([]);
  }, [bufferedJobs, updateStats]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return {
    jobs,
    bufferedJobsCount: bufferedJobs.length,
    isPaused,
    connectionState,
    errorMessage,
    nextScanInSeconds,
    stats,
    togglePause,
    flushBuffer,
  };
}
