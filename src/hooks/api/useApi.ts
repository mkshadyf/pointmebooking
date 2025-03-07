import { API_TIMEOUT } from '@/constants';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  cache?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();


const handleError = (err: unknown): Error => {
  if (err instanceof Error) return err;
  if (typeof err === 'string') return new Error(err);
  return new Error('An unknown error occurred');
};

export function useApi<T>(url: string, options: UseApiOptions<T> = {}) {
  const {
    initialData,
    onSuccess,
    onError,
    cache: useCache = true,
    cacheKey = url,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if data is in cache and not expired
  const getCachedData = useCallback(() => {
    if (!useCache) return null;

    const cachedItem = cache.get(cacheKey);
    if (!cachedItem) return null;

    const isExpired = Date.now() - cachedItem.timestamp > cacheDuration;
    if (isExpired) {
      cache.delete(cacheKey);
      return null;
    }

    return cachedItem.data;
  }, [useCache, cacheKey, cacheDuration]);

  // Set data in cache
  const setCachedData = useCallback(
    (data: T) => {
      if (!useCache) return;
      cache.set(cacheKey, { data, timestamp: Date.now() });
    },
    [useCache, cacheKey]
  );

  // Fetch data
  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          onSuccess?.(cachedData);
          setIsLoading(false);
          return;
        }

        // Set up timeout
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
          throw new Error('Request timeout');
        }, API_TIMEOUT);

        const response = await fetch(url, { signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setCachedData(result);
        onSuccess?.(result);
      } catch (err) {
        const error = handleError(err);
        if (error.name === 'AbortError') return;
        setError(error);
        onError?.(error);
        return { data: null, error };
      } finally {
        setIsLoading(false);
      }
    },
    [url, getCachedData, setCachedData, onSuccess, onError]
  );

  // Refetch data
  const refetch = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    return fetchData(abortControllerRef.current.signal);
  }, [fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  // Initial fetch
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    refetch,
    clearCache,
  };
} 