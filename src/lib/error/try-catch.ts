/**
 * Try-Catch Utilities
 * 
 * This module provides enhanced try-catch utilities with built-in error logging
 * and recovery mechanisms.
 */

import { logError } from './error-logger';

/**
 * Enhanced try-catch with error logging
 * @param fn - The function to execute
 * @param userId - Optional user ID for error logging
 * @param context - Optional context information for error logging
 * @returns The result of the function or null if an error occurred
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  userId?: string,
  context?: Record<string, any>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const result = await fn();
    return { data: result, error: null };
  } catch (error) {
    // Log the error
    await logError(error as Error, userId, context);
    return { data: null, error: error as Error };
  }
}

/**
 * Enhanced try-catch with error logging and retry mechanism
 * @param fn - The function to execute
 * @param retries - Number of retries (default: 3)
 * @param delay - Delay between retries in ms (default: 1000)
 * @param userId - Optional user ID for error logging
 * @param context - Optional context information for error logging
 * @returns The result of the function or null if all retries failed
 */
export async function tryCatchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  userId?: string,
  context?: Record<string, any>
): Promise<{ data: T | null; error: Error | null }> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await fn();
      return { data: result, error: null };
    } catch (error) {
      lastError = error as Error;
      
      // Log the error with retry information
      await logError(error as Error, userId, {
        ...context,
        retry: {
          attempt,
          maxRetries: retries
        }
      });
      
      // If this was the last attempt, don't delay
      if (attempt === retries) break;
      
      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { data: null, error: lastError };
}

/**
 * Execute a function with a timeout
 * @param fn - The function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param userId - Optional user ID for error logging
 * @param context - Optional context information for error logging
 * @returns The result of the function or null if it timed out
 */
export async function tryCatchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  userId?: string,
  context?: Record<string, any>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    const result = await Promise.race([fn(), timeoutPromise]) as T;
    return { data: result, error: null };
  } catch (error) {
    // Log the error
    await logError(error as Error, userId, {
      ...context,
      timeout: timeoutMs
    });
    return { data: null, error: error as Error };
  }
} 