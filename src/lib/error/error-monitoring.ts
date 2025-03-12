/**
 * Error Monitoring Utility
 * 
 * This module provides tracking and debugging for error flow in the application,
 * particularly to identify sources of empty error objects.
 */

// Enable this in development to get detailed tracking
const DEBUG_MODE = process.env.NODE_ENV !== 'production';

// Create a global registry to track error origins
const ERROR_ORIGINS = new Map<string, number>();

export interface ErrorTrackingOptions {
  // Source of the error (component, function, etc.)
  source: string;
  // Additional context information
  context?: Record<string, any>;
  // Timestamp of the error
  timestamp?: string;
}

/**
 * Track an error before it's processed by the error handling system
 * This helps identify where empty error objects are coming from
 * 
 * @param error The error being processed
 * @param options Tracking options
 * @returns The original error for chaining
 */
export function trackError(error: any, options: ErrorTrackingOptions): any {
  if (!DEBUG_MODE) return error;
  
  const { source, context = {}, timestamp = new Date().toISOString() } = options;
  
  // Check for empty error objects
  const isEmpty = !error || (typeof error === 'object' && Object.keys(error).length === 0);
  
  // Increment the count for this source
  const currentCount = ERROR_ORIGINS.get(source) || 0;
  ERROR_ORIGINS.set(source, currentCount + 1);
  
  if (isEmpty) {
    // Log immediately for empty errors to capture the stack trace
    console.warn(`[ERROR TRACKER] Empty error object detected from source: ${source}`, {
      source,
      context,
      timestamp,
      errorIsEmpty: true,
      callStack: new Error().stack
    });
  } else if (DEBUG_MODE) {
    // In debug mode, log non-empty errors too
    console.debug(`[ERROR TRACKER] Error tracked from source: ${source}`, {
      source,
      errorType: error?.constructor?.name || typeof error,
      hasMessage: !!error?.message,
      timestamp
    });
  }
  
  // Attach tracking information to the error if it's an object
  if (error && typeof error === 'object') {
    try {
      // Check if the property already exists to avoid "Cannot redefine property" errors
      if (!error.__errorTracking) {
        Object.defineProperty(error, '__errorTracking', {
          value: { source, timestamp, isEmpty },
          enumerable: false,
          configurable: true  // Make it configurable so it can be redefined
        });
      } else {
        // If it already exists, append this source to the tracking info
        error.__errorTracking.sources = error.__errorTracking.sources || [];
        error.__errorTracking.sources.push(source);
      }
    } catch (e) {
      // Some errors may not allow properties to be added
      console.debug('Could not attach tracking info to error', e);
    }
  }
  
  return error;
}

/**
 * Print a report of error origins to help debug issues
 */
export function printErrorReport(): void {
  if (!DEBUG_MODE) return;
  
  console.group('Error Origin Report');
  console.log('Total unique error sources:', ERROR_ORIGINS.size);
  
  // Sort by count (highest first)
  const sortedEntries = [...ERROR_ORIGINS.entries()]
    .sort((a, b) => b[1] - a[1]);
  
  sortedEntries.forEach(([source, count]) => {
    console.log(`${source}: ${count} errors`);
  });
  
  console.groupEnd();
}

// Set up an interval to print the report in development
if (DEBUG_MODE && typeof window !== 'undefined') {
  // Print a report every 10 seconds in the console
  const intervalId = setInterval(() => {
    if (ERROR_ORIGINS.size > 0) {
      printErrorReport();
    }
  }, 10000);
  
  // Clean up on unmount
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
} 