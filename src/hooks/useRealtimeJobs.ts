import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Job, ConnectionState, DashboardStats } from '../types/job';

export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bufferedJobs, setBufferedJobs] = useState<Job[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [stats, setStats] = useState<DashboardStats>({
    jobsLastHour: 0,
    medianDelayMinutes: null,
    totalActiveJobs: 0,
  });

  const lastSeenDetectedAtRef = useRef<string | null>(null);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  // Calculate live statistics
  const updateStats = useCallback((jobList: Job[]) => {
    const now = new Date().getTime();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Jobs found in last 1 hour
    const lastHourCount = jobList.filter(
      (j) => new Date(j.detected_at).getTime() >= oneHourAgo
    ).length;

    // Median detection delay (detected_at - posted_at) in minutes
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

  // Backfill jobs missed during a dropped websocket connection
  const backfillMissedJobs = useCallback(async () => {
    if (!lastSeenDetectedAtRef.current) return;

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .gt('detected_at', lastSeenDetectedAtRef.current)
        .order('detected_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const newJobs: Job[] = data.map((j) => ({ ...j, isNew: true }));

        if (isPausedRef.current) {
          setBufferedJobs((prev) => [...newJobs, ...prev]);
        } else {
          setJobs((prev) => {
            const combined = [...newJobs, ...prev];
            const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
            updateStats(unique);
            return unique;
          });
        }
        lastSeenDetectedAtRef.current = data[0].detected_at;
      }
    } catch (err) {
      console.error('Backfill error:', err);
    }
  }, [updateStats]);

  // Initial fetch
  useEffect(() => {
    async function fetchInitialJobs() {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(200);

        if (error) throw error;

        if (data && data.length > 0) {
          setJobs(data);
          lastSeenDetectedAtRef.current = data[0].detected_at;
          updateStats(data);
        }
      } catch (err) {
        console.error('Error loading initial jobs from Supabase:', err);
      }
    }

    fetchInitialJobs();
  }, [updateStats]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
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
              updateStats(updated);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('connected');
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionState('reconnecting');
          setTimeout(() => {
            backfillMissedJobs();
          }, 3000);
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionState('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [updateStats, backfillMissedJobs]);

  // Flush buffer queue when user clicks pill
  const flushBuffer = useCallback(() => {
    if (bufferedJobs.length === 0) return;
    setJobs((prev) => {
      const combined = [...bufferedJobs, ...prev];
      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
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
    stats,
    togglePause,
    flushBuffer,
  };
}
