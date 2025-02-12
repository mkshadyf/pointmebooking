'use client';

import { useEffect, useRef, useState } from 'react';

// Debounce a value
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounce a function
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  deps: any[] = []
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useRef((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }).current;
}

// Debounce a function with leading and trailing options
export function useDebouncedFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 500,
  options: { leading?: boolean; trailing?: boolean } = {}
) {
  const { leading = false, trailing = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const leadingRef = useRef(true);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useRef((...args: Parameters<T>) => {
    const shouldCallLeading = leading && leadingRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (shouldCallLeading) {
      fn(...args);
      leadingRef.current = false;
    }

    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        fn(...args);
      }
      leadingRef.current = true;
    }, delay);
  }).current;
} 