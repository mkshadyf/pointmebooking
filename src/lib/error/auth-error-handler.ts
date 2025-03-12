/**
 * Auth Error Handler
 * Provides specialized error handling for authentication operations
 */

import { ToastService } from '@/lib/core/toast';
import { convertToAuthError } from './auth-error-utils';
import { ErrorHandler } from './error-handler';
import { interceptError, isEmptyError } from './error-interceptor';
import { logError } from './error-logger';
import { trackError } from './error-monitoring';

// Flag to prevent recursive error handling
let isHandlingAuthError = false;

/**
 * Get a user-friendly error message for authentication errors
 * @param error The error that occurred
 * @returns A user-friendly error message
 */
export function getAuthErrorMessage(error: any): string {
  // CRITICAL: Intercept empty errors immediately
  if (isEmptyError(error)) {
    error = interceptError(error, 'getAuthErrorMessage', { context: 'auth' });
    return 'An unknown error occurred during authentication. Please try again.';
  }
  
  // Convert to standard auth error format
  const authError = convertToAuthError(error);
  
  // Extract error code/message
  const errorCode = authError.code || '';
  const errorMessage = authError.message || '';
  
  // Network connectivity errors
  if (
    errorMessage.includes('Failed to fetch') || 
    errorMessage.includes('network') ||
    error instanceof TypeError && errorMessage.includes('fetch')
  ) {
    return 'Unable to connect to the authentication service. Please check your internet connection and try again.';
  }
  
  // Authentication errors
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  
  if (errorCode.includes('user-not-found') || errorMessage.includes('user not found')) {
    return 'No account found with this email address. Please check your email or sign up.';
  }
  
  if (errorCode.includes('wrong-password') || errorMessage.includes('wrong password')) {
    return 'Incorrect password. Please try again or reset your password.';
  }
  
  if (errorCode.includes('email-already-in-use') || errorMessage.includes('already in use')) {
    return 'This email is already registered. Please try logging in instead.';
  }
  
  if (errorCode.includes('weak-password') || errorMessage.includes('weak password')) {
    return 'Password is too weak. Please use a stronger password.';
  }
  
  if (errorCode.includes('expired') || errorMessage.includes('expired')) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (errorCode.includes('too-many-requests') || errorMessage.includes('too many requests')) {
    return 'Too many login attempts. Please try again later or reset your password.';
  }
  
  // Fallback to the error message or a generic one
  return errorMessage || 'Authentication failed. Please try again.';
}

/**
 * Handle authentication errors with consistent messaging and logging
 * @param error The error that occurred
 * @param options Error handling options
 */
export function handleAuthError(error: any, options: ErrorHandler = {}): void {
  try {
    // Prevent recursive handling
    if (isHandlingAuthError) {
      console.warn('[AUTH ERROR HANDLER] Breaking potential infinite error handling loop', {
        errorType: typeof error,
        options,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Set flag to prevent recursion
    isHandlingAuthError = true;
    
    // Default options
    const opts = {
      showToast: true,
      context: 'auth',
      action: 'authentication',
      ...options
    };
    
    // Debug info to help trace empty error origin
    console.debug('[AUTH ERROR HANDLER] Processing error', {
      errorType: typeof error,
      isEmpty: isEmptyError(error),
      context: opts.context,
      action: opts.action,
      errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
      timestamp: new Date().toISOString()
    });
    
    // CRITICAL: Intercept empty errors immediately - this is our first line of defense
    const source = `handleAuthError:${opts.context || 'unknown'}-${opts.action || 'unknown'}`;
    if (isEmptyError(error)) {
      console.warn('[AUTH ERROR HANDLER] Intercepting empty error', {
        context: opts.context,
        action: opts.action,
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
        location: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });
      
      error = interceptError(error, source, { 
        ...opts,
        handlingTimestamp: new Date().toISOString(),
        location: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });
    }
    
    // Store original error state for diagnostics
    const originalErrorType = error === null 
      ? 'null' 
      : (error === undefined 
          ? 'undefined' 
          : (typeof error === 'object' && Object.keys(error).length === 0 
              ? 'empty_object' 
              : typeof error));
              
    // Create error stack trace early
    const errorStack = error?.stack || new Error().stack;
    
    // Track the error origin
    error = trackError(error, {
      source,
      context: { 
        ...opts,
        originalErrorType,
        hasStack: !!error?.stack,
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : []
      }
    });
    
    // Create a standardized error if we received an empty object, null, or undefined
    // This should never happen if our interceptError is working correctly
    let processedError = error;
    
    if (isEmptyError(error)) {
      console.warn('[AUTH ERROR HANDLER] Empty error after interception - this should never happen', {
        originalErrorType,
        context: opts.context,
        action: opts.action,
        userMessage: 'Authentication error',
        timestamp: new Date().toISOString(),
        stack: errorStack
      });
      
      // Create a standardized error for empty objects
      processedError = interceptError(
        new Error(`Critical auth error failure (${originalErrorType} received during ${opts.action})`),
        `${source}.criticalFailureHandler`,
        { 
          originalErrorType,
          ...opts
        }
      );
    }
    
    // Get user-friendly message
    const userMessage = getAuthErrorMessage(processedError);
    
    // Log the error with additional context
    logError(processedError, opts.userId, {
      context: opts.context,
      action: opts.action,
      originalErrorType,
      userMessage,
      // Add more context about the empty error
      emptyErrorReceived: isEmptyError(error),
      hasTrackingInfo: !!error?.__errorTracking,
      errorStack: errorStack
    });
    
    // Set error message state if a setter is provided
    if (opts.setErrorMessage) {
      opts.setErrorMessage(userMessage);
    }
    
    // Show toast notification if enabled
    if (opts.showToast) {
      ToastService.error(userMessage);
    }
  } catch (metaError) {
    // Last resort error handling for the error handler itself
    console.error('[AUTH ERROR HANDLER] Meta-error in error handler:', metaError);
    
    // Always show some notification to the user
    if (options.setErrorMessage) {
      options.setErrorMessage('An error occurred during authentication. Please try again.');
    }
    
    if (options.showToast !== false) {
      ToastService.error('An error occurred during authentication. Please try again.');
    }
    
    // Try to log the meta-error
    try {
      logError(metaError, options.userId, {
        context: 'auth-error-handler',
        action: 'meta-error',
        originalRequest: options
      });
    } catch (_) {
      // Absolutely last resort - just log to console
      console.error('[CRITICAL] Complete failure in auth error handling system', metaError);
    }
  } finally {
    // Always reset the flag to prevent locking error handling
    isHandlingAuthError = false;
  }
}

/**
 * Check if the device is online
 * @param setErrorMessage Optional function to set error message state
 * @returns Boolean indicating whether the device is online
 */
export function checkOnlineStatus(setErrorMessage?: (message: string | null) => void): boolean {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  if (!isOnline) {
    const message = 'No internet connection. Please check your network and try again.';
    
    if (setErrorMessage) {
      setErrorMessage(message);
    }
    
    ToastService.error(message);
  }
  
  return isOnline;
}

/**
 * Wrap an auth operation with consistent error handling
 * @param operation The async operation to perform
 * @param options Error handling options
 * @returns The result of the operation or null if an error occurred
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  options: ErrorHandler = {}
): Promise<T | null> {
  // Check online status first
  if (!checkOnlineStatus(options.setErrorMessage)) {
    return null;
  }
  
  try {
    return await operation();
  } catch (error) {
    // CRITICAL: Intercept empty errors immediately
    const source = `withAuthErrorHandling:${options.context || 'unknown'}-${options.action || 'unknown'}`;
    if (isEmptyError(error)) {
      error = interceptError(error, source, options);
    }
    
    // Track the error
    error = trackError(error, {
      source,
      context: options
    });
    
    handleAuthError(error, options);
    return null;
  }
} 