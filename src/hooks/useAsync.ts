import { useCallback, useEffect, useRef, useState } from "react";

interface Cached<T> {
  data: T;
  at: number;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Timestamp (ms) of last successful fetch, from cache or live. */
  updatedAt: number | null;
  stale: boolean;
  refresh: () => void;
}

/**
 * Fetch with localStorage caching, periodic refresh and no fake fallback values.
 * On failure the last cached value (if any) is kept and flagged as stale.
 */
export function useAsync<T>(
  key: string,
  fn: () => Promise<T>,
  opts: { ttlMs?: number; refreshMs?: number } = {},
): AsyncState<T> {
  const { ttlMs = 60_000, refreshMs } = opts;
  const read = (): Cached<T> | null => {
    try {
      const raw = localStorage.getItem(`ibo:${key}`);
      return raw ? (JSON.parse(raw) as Cached<T>) : null;
    } catch {
      return null;
    }
  };

  const initial = useRef(read());
  const [data, setData] = useState<T | null>(initial.current?.data ?? null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(initial.current?.at ?? null);
  const [loading, setLoading] = useState(!initial.current);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(
    async (force = false) => {
      const cached = read();
      if (!force && cached && Date.now() - cached.at < ttlMs) {
        setData(cached.data);
        setUpdatedAt(cached.at);
        setLoading(false);
        return;
      }
      setLoading(!cached);
      setError(null);
      try {
        const result = await fnRef.current();
        const at = Date.now();
        setData(result);
        setUpdatedAt(at);
        setStale(false);
        try {
          localStorage.setItem(`ibo:${key}`, JSON.stringify({ data: result, at }));
        } catch {
          /* storage unavailable */
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load data.");
        if (cached) setStale(true);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, ttlMs],
  );

  useEffect(() => {
    run();
    if (!refreshMs) return;
    const id = setInterval(() => run(true), refreshMs);
    return () => clearInterval(id);
  }, [run, refreshMs]);

  return { data, loading, error, updatedAt, stale, refresh: () => run(true) };
}
