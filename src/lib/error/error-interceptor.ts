/**
 * Error Interceptor System
 * 
 * A centralized system to intercept and normalize ALL errors in the application.
 * This file should be imported by all other error handling modules.
 */

// Custom interface to extend Error with our properties
interface InterceptedError extends Error {
  __intercepted?: boolean;
  __source?: string;
  __timestamp?: string;
  __context?: Record<string, any>;
  __diagnostics?: {
    originalType: string;
    hasMessage: boolean;
    hasStack: boolean;
    intercepted: boolean;
    wasEmpty?: boolean;
  };
}

// Flag to prevent recursive console.error handling
let isHandlingConsoleError = false;

// Store the original console methods before we override them
const originalConsoleError = typeof console !== 'undefined' ? console.error : null;
const originalConsoleWarn = typeof console !== 'undefined' ? console.warn : null;

// Single source of truth for error type checking
export function isEmptyError(error: any): boolean {
  return (
    !error || 
    (typeof error === 'object' && Object.keys(error).length === 0) ||
    (error instanceof Error && !error.message && !error.name && !error.stack)
  );
}

/**
 * Safe console warn that avoids circular references
 */
function safeConsoleWarn(...args: any[]): void {
  if (originalConsoleWarn) {
    originalConsoleWarn.apply(console, args);
  } else {
    // Last resort fallback
    try {
      console.warn(...args);
    } catch (e) {
      // Completely silent if even this fails
    }
  }
}

// Guarantee that an error is never empty
export function ensureError(error: any, source: string = 'unknown'): InterceptedError {
  // If it's already a non-empty Error, return it
  if (error instanceof Error && !isEmptyError(error)) {
    return error as InterceptedError;
  }
  
  // If it's empty, create a standardized error
  if (isEmptyError(error)) {
    safeConsoleWarn(`[ERROR INTERCEPTOR] Empty error intercepted from ${source}`, {
      originalError: error,
      stack: new Error().stack,
      timestamp: new Date().toISOString()
    });
    
    return new Error(`Unknown error intercepted from ${source}`) as InterceptedError;
  }
  
  // If it's a string, wrap it in an Error
  if (typeof error === 'string') {
    return new Error(error) as InterceptedError;
  }
  
  // For other types, stringify and wrap
  try {
    const errorDetail = typeof error === 'object' 
      ? JSON.stringify(error) 
      : String(error);
    
    return new Error(`Non-standard error: ${errorDetail}`) as InterceptedError;
  } catch (e) {
    // Last resort if JSON.stringify fails
    return new Error(`Unprocessable error from ${source}`) as InterceptedError;
  }
}

// Add diagnostic properties to errors
export function addDiagnostics(error: InterceptedError, source: string, context?: Record<string, any>): InterceptedError {
  try {
    // Don't overwrite existing props
    if (!error.__intercepted) {
      Object.defineProperties(error, {
        __intercepted: {
          value: true,
          enumerable: false,
          configurable: false
        },
        __source: {
          value: source,
          enumerable: false,
          configurable: false
        },
        __timestamp: {
          value: new Date().toISOString(),
          enumerable: false,
          configurable: false
        },
        __context: {
          value: context || {},
          enumerable: false,
          configurable: false
        },
        __diagnostics: {
          value: {
            originalType: error.constructor.name,
            hasMessage: !!error.message,
            hasStack: !!error.stack,
            intercepted: true,
            wasEmpty: isEmptyError(error)
          },
          enumerable: false,
          configurable: false
        }
      });
    }
    
    return error;
  } catch (e) {
    // If property adding fails, return original error
    safeConsoleWarn(`[ERROR INTERCEPTOR] Failed to add diagnostics to error: ${e}`);
    return error;
  }
}

// Main entry point for all error handling
export function interceptError(error: any, source: string, context?: Record<string, any>): InterceptedError {
  // First ensure it's a valid Error object
  const validError = ensureError(error, source);
  
  // Then add diagnostics
  return addDiagnostics(validError, source, context);
}

// Global error interceptor for console.error
export function setupGlobalErrorInterception(): void {
  if (typeof window !== 'undefined') {
    // Override console.error to intercept empty errors
    console.error = function(...args) {
      // CRITICAL: Prevent recursive handling
      if (isHandlingConsoleError) {
        // If we're already handling a console.error call, just pass through to original
        if (originalConsoleError) {
          originalConsoleError.apply(console, args);
        }
        return;
      }
      
      try {
        // Set flag to prevent recursion
        isHandlingConsoleError = true;
        
        // Check if first argument is an empty error object
        if (args.length > 0 && isEmptyError(args[0]) && !args[0]?.__intercepted) {
          // Replace with intercepted error
          args[0] = interceptError(
            args[0], 
            'console.error', 
            { originalArgs: args.slice(1) }
          );
          
          // Log that we intercepted an empty error
          safeConsoleWarn('[ERROR INTERCEPTOR] Intercepted empty error in console.error', {
            interceptedError: args[0],
            timestamp: new Date().toISOString()
          });
        }
        
        // Call original console.error if available
        if (originalConsoleError) {
          originalConsoleError.apply(console, args);
        } else {
          // Fallback if original isn't available (should never happen)
          const nativeError = Function.prototype.bind.call(console.error, console);
          nativeError.apply(console, args);
        }
      } catch (metaError) {
        // Last resort error handling
        safeConsoleWarn('[ERROR INTERCEPTOR] Failed to process console.error:', metaError);
        
        // Try to call the original anyway
        if (originalConsoleError) {
          originalConsoleError.apply(console, args);
        }
      } finally {
        // Always reset the flag
        isHandlingConsoleError = false;
      }
    };
    
    safeConsoleWarn('[ERROR INTERCEPTOR] Global error interception enabled');
  }
}

// Call this in your _app.tsx or similar entry point
export function initializeErrorInterception(): void {
  setupGlobalErrorInterception();
  
  // Additional initialization if needed
  // - Add global unhandledrejection listener
  // - Add global error boundary
  // - Add React error boundary

  // Add unhandledrejection listener to catch unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      try {
        // Prevent the default browser behavior (which would log the error)
        event.preventDefault();
        
        // Intercept and process the error
        const interceptedError = interceptError(
          event.reason || new Error('Unhandled promise rejection'), 
          'unhandledrejection', 
          { originalEvent: 'unhandledrejection' }
        );
        
        // Log using our standard error logger - BUT be careful of circular references
        // Use direct console methods to avoid our own interception
        if (originalConsoleError) {
          originalConsoleError.call(console, '[UNHANDLED REJECTION]', interceptedError);
        } else {
          // Fallback to warn to avoid circular references
          safeConsoleWarn('[UNHANDLED REJECTION]', interceptedError);
        }
      } catch (metaError) {
        // If our handling fails, at least log something
        safeConsoleWarn('[ERROR INTERCEPTOR] Failed to handle unhandled rejection:', metaError);
      }
    });
    
    safeConsoleWarn('[ERROR INTERCEPTOR] Unhandled rejection interception enabled');
  }
} 