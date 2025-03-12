/**
 * Error Logger Module
 * 
 * This module provides centralized error logging utilities for the application.
 * It logs errors to both the console and the database for tracking and analysis.
 */

import { supabaseClientService } from '../supabase/services/core/supabase-client.service';
import { createAppError, ErrorCategory, ErrorCode, ErrorSeverity, isAppError } from './error-handler';
import { interceptError, isEmptyError } from './error-interceptor';
import { trackError } from './error-monitoring';

// Disable our interceptor temporarily when logging
let isDirectLoggingInProgress = false;

// Store the original console.error method when module loads
// This happens before any overrides from error-interceptor.ts
const nativeConsoleError = typeof console !== 'undefined' ? console.error : null;

/**
 * Error Logger Service
 * Handles logging errors to console and database
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  
  private constructor() {}
  
  /**
   * Get the singleton instance of ErrorLogger
   */
  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }
  
  /**
   * Log an error to console and database
   * @param error - The error to log
   * @param userId - Optional user ID associated with the error
   * @param context - Optional context information
   */
  async logError(error: any, userId?: string, context?: Record<string, any>): Promise<void> {
    try {
      // CRITICAL: Prevent circular logging
      if (isDirectLoggingInProgress) {
        console.warn('[ERROR LOGGER] Breaking potential infinite logging loop');
        return;
      }
      
      isDirectLoggingInProgress = true;
      
      // CRITICAL: Intercept any empty errors first - this is our first line of defense
      const source = `ErrorLogger.logError:${context?.action || 'unknown'}`;
      if (isEmptyError(error)) {
        error = interceptError(error, source, { userId, ...context });
      }
      
      // Store original error type for diagnostic purposes
      const originalErrorType = error === null 
        ? 'null' 
        : (error === undefined 
            ? 'undefined' 
            : (typeof error === 'object' && Object.keys(error).length === 0 
                ? 'empty_object' 
                : typeof error));
                
      // Create error stack trace early, in case we need it
      const errorStack = error?.stack || new Error().stack;
      
      // Special handling for Next.js error boundary - these can be empty objects
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        console.warn('[ERROR LOGGER] Empty error object received', {
          originalErrorType,
          source: 'NextJS_ErrorBoundary',
          context,
          userId,
          timestamp: new Date().toISOString(),
          stack: errorStack
        });
        
        // Create a standardized error with context for empty objects
        error = interceptError(
          new Error(`Unknown error (empty object from ${context?.source || context?.action || 'Next.js error boundary'})`),
          `${source}.emptyObjectHandler`,
          { 
            originalErrorType,
            userId, 
            ...context 
          }
        );
      } else {
        // Track the error before processing it (for non-empty errors)
        error = trackError(error, {
          source,
          context: { userId, ...context }
        });
      }
      
      // Handle null or undefined errors - this is a safety check that should never trigger
      // if our interceptError is working correctly
      if (!error) {
        console.warn('[ERROR LOGGER] Null or undefined error after interception - this should never happen', {
          originalErrorType,
          context,
          userId,
          timestamp: new Date().toISOString(),
          stack: errorStack
        });
        
        // Create a standardized error for null/undefined
        error = interceptError(
          new Error(`Critical error handler failure (${originalErrorType} received from ${context?.source || context?.action || 'unknown source'})`),
          `${source}.criticalFailureHandler`,
          { 
            originalErrorType,
            userId, 
            context,
            errorStack 
          }
        );
      }
      
      // Convert to AppError if not already
      const appError = isAppError(error) 
        ? error 
        : createAppError(
            error?.message || 'Unknown error',
            ErrorCode.UNKNOWN_ERROR,
            ErrorCategory.INTERNAL,
            ErrorSeverity.ERROR,
            {
              ...(error?.stack ? { stack: error.stack } : {}),
              originalErrorType,
              errorSource: error.__source || source,
              errorContext: error.__context || context,
              intercepted: error.__intercepted || false
            }
          );
      
      // Add a custom error message for empty objects to make debugging easier
      if (error.__diagnostics?.wasEmpty) {
        appError.message = `Empty error object from ${error.__source || 'unknown source'}`;
      }
      
      // CRITICAL: Use a direct approach to log to console WITHOUT triggering our interceptor
      // This prevents an infinite loop if our console.error interceptor is active
      const errorOutput = {
        message: appError.message,
        code: appError.code,
        category: appError.category,
        severity: appError.severity,
        userId,
        context,
        details: appError.details,
        timestamp: new Date().toISOString(),
        tracking: error.__errorTracking,
        diagnostics: error.__diagnostics,
        originalErrorType
      };
      
      // Use the stored native console.error if available, otherwise use a safe approach
      if (nativeConsoleError) {
        // This uses the original console.error from when the module loaded
        nativeConsoleError.call(console, '[ERROR]', errorOutput);
      } else {
        // Fallback - use console.warn to avoid potential recursion with console.error
        console.warn('[ERROR LOG]', errorOutput);
      }
      
      // Log to database
      try {
        const client = await supabaseClientService.getClient();
        await client.from('error_logs').insert({
          error_code: appError.code,
          error_message: appError.message,
          context: context ? JSON.stringify({ 
            ...context, 
            ...appError.details, 
            originalErrorType,
            tracking: error.__errorTracking,
            diagnostics: error.__diagnostics
          }) : JSON.stringify({ 
            ...appError.details, 
            originalErrorType,
            tracking: error.__errorTracking,
            diagnostics: error.__diagnostics
          }),
          stack_trace: appError.details?.stack as string || errorStack || null,
          user_id: userId || null
        });
      } catch (dbError) {
        // If database logging fails, just log to console
        console.warn('[ERROR LOGGER] Failed to log to database:', dbError);
      }
    } catch (metaError) {
      // Last resort error handling to prevent infinite loops
      console.warn('[ERROR LOGGER] Meta-error in error logging system:', metaError);
    } finally {
      // Always reset the flag to allow future logging
      isDirectLoggingInProgress = false;
    }
  }
  
  /**
   * Log an error and return it (for chaining)
   * @param error - The error to log
   * @param userId - Optional user ID associated with the error
   * @param context - Optional context information
   */
  async logAndReturn<T extends Error>(error: T, userId?: string, context?: Record<string, any>): Promise<T> {
    await this.logError(error, userId, context);
    return error;
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Helper function for easier usage
export async function logError(error: any, userId?: string, context?: Record<string, any>): Promise<void> {
  try {
    // CRITICAL: Prevent recursive logging
    if (isDirectLoggingInProgress) {
      console.warn('[ERROR LOGGER] Breaking potential infinite logging loop in logError');
      return;
    }
    
    // CRITICAL: Intercept any empty errors immediately
    const source = `logError:${context?.action || 'unknown'}`;
    if (isEmptyError(error)) {
      error = interceptError(error, source, { userId, ...context });
    }
    
    // Store original error type before manipulation
    const originalErrorType = error === null 
      ? 'null' 
      : (error === undefined 
          ? 'undefined' 
          : (typeof error === 'object' && Object.keys(error).length === 0 
              ? 'empty_object' 
              : typeof error));
              
    // Add more context about the original error
    const enhancedContext = {
      ...context,
      originalErrorType,
      fromStandaloneLogger: true
    };
    
    // Track the error at the standalone function level too
    error = trackError(error, {
      source,
      context: { userId, originalErrorType, ...context }
    });
    
    return errorLogger.logError(error, userId, enhancedContext);
  } catch (metaError) {
    // Last resort error handling for the standalone function
    console.warn('[ERROR LOGGER] Meta-error in standalone logError function:', metaError);
    
    // Try to at least log something useful
    try {
      // Use direct logging to avoid interceptors
      console.warn('[ERROR] Original error could not be processed', {
        errorType: typeof error,
        context,
        userId,
        timestamp: new Date().toISOString(),
        metaError
      });
    } catch (_) {
      // Absolutely last resort
      console.warn('[CRITICAL] Complete failure in error logging system');
    }
    
    return Promise.resolve();
  }
} 