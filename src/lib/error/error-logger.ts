/**
 * Error Logger Module
 * 
 * This module provides centralized error logging utilities for the application.
 * It logs errors to both the console and the database for tracking and analysis.
 */

import { supabaseClientService } from '../supabase/services/core/supabase-client.service';
import { createAppError, ErrorCategory, ErrorCode, ErrorSeverity, isAppError } from './error-handler';

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
    // Convert to AppError if not already
    const appError = isAppError(error) 
      ? error 
      : createAppError(
          error?.message || 'Unknown error',
          ErrorCode.UNKNOWN_ERROR,
          ErrorCategory.INTERNAL,
          ErrorSeverity.ERROR,
          error?.stack ? { stack: error.stack } : {}
        );
    
    // Log to console
    console.error('[ERROR]', {
      message: appError.message,
      code: appError.code,
      category: appError.category,
      severity: appError.severity,
      details: appError.details,
      userId
    });
    
    // Log to database
    try {
      const client = await supabaseClientService.getClient();
      await client.from('error_logs').insert({
        error_code: appError.code,
        error_message: appError.message,
        context: context ? JSON.stringify({ ...context, ...appError.details }) : JSON.stringify(appError.details),
        stack_trace: appError.details?.stack as string || null,
        user_id: userId || null
      });
    } catch (dbError) {
      // If database logging fails, just log to console
      console.error('[ERROR LOGGER] Failed to log to database:', dbError);
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
  return errorLogger.logError(error, userId, context);
} 