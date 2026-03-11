import { useState, useEffect, useCallback } from "react";

/**
 * Generic hook for fetching data.
 * @param {Function} fetcher  — async function returning data
 * @param {Array}    deps     — useEffect dependencies
 */
export function useFetch(fetcher, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

/**
 * Hook for submitting forms/mutations.
 * @param {Function} action — async function (data) => response
 */
export function useAction(action) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await action(data);
      return { ok: true, data: result };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [action]);

  return { execute, loading, error, setError };
}
