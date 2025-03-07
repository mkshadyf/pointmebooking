/**
 * Auth Error Utilities
 * 
 * This module provides utilities for converting between AppError and AuthError types.
 */

import { AuthError } from '@/types/database/auth';
import { AppError, ErrorCategory, ErrorSeverity, createAppError } from './error-handler';

/**
 * Convert an AppError to an AuthError
 * @param error - The AppError to convert
 * @returns An AuthError
 */
export function appErrorToAuthError(error: AppError): AuthError {
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    status: getStatusCodeFromCategory(error.category),
    details: error.details || {},
    // Add __isAuthError property for compatibility with Supabase AuthError
    __isAuthError: true
  };
}

/**
 * Convert any error to an AuthError
 * This is a convenience function for handling errors in auth services
 * @param error - Any error to convert
 * @returns An AuthError
 */
export function convertToAuthError(error: any): AuthError {
  // If it's already an AuthError with __isAuthError, return it
  if (error && 
      typeof error === 'object' && 
      'name' in error && 
      'message' in error && 
      '__isAuthError' in error) {
    return error;
  }
  
  // If it's an error-like object, convert it
  if (error && typeof error === 'object' && 'name' in error && 'message' in error) {
    return {
      name: error.name || 'AuthError',
      message: error.message || 'An authentication error occurred',
      code: error.code || 'auth/unknown-error',
      status: error.status || 500,
      details: error.details || {},
      // Add __isAuthError property for compatibility with Supabase AuthError
      __isAuthError: true
    };
  }
  
  // Convert string errors
  if (typeof error === 'string') {
    return {
      name: 'AuthError',
      message: error,
      code: 'auth/unknown-error',
      status: 500,
      details: {},
      // Add __isAuthError property for compatibility with Supabase AuthError
      __isAuthError: true
    };
  }
  
  // Default error
  return {
    name: 'AuthError',
    message: 'An unknown authentication error occurred',
    code: 'auth/unknown-error',
    status: 500,
    details: { originalError: error },
    // Add __isAuthError property for compatibility with Supabase AuthError
    __isAuthError: true
  };
}

// For backward compatibility
export const toAuthError = convertToAuthError;

/**
 * Convert an AuthError to an AppError
 * @param error - The AuthError to convert
 * @returns An AppError
 */
export function authErrorToAppError(error: AuthError): AppError {
  return createAppError(
    error.message,
    error.code || 'auth/unknown-error',
    ErrorCategory.AUTHENTICATION,
    ErrorSeverity.WARNING,
    error.details || {},
    'auth-service'
  );
}

/**
 * Get an HTTP status code from an error category
 * @param category - The error category
 * @returns An HTTP status code
 */
function getStatusCodeFromCategory(category: ErrorCategory): number {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return 400;
    case ErrorCategory.AUTHENTICATION:
      return 401;
    case ErrorCategory.AUTHORIZATION:
      return 403;
    case ErrorCategory.NOT_FOUND:
      return 404;
    case ErrorCategory.RATE_LIMIT:
      return 429;
    default:
      return 500;
  }
} 