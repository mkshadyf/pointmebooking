/**
 * Error Handler Module
 * 
 * This module provides centralized error handling utilities for the application.
 * It includes error types, error creation functions, and error handling utilities.
 * 
 * Key components:
 * - ErrorCode enum: Standardized error codes for different error types
 * - ErrorCategory enum: Classification of errors by category
 * - ErrorSeverity enum: Classification of errors by severity
 * - AppError interface: Standard error interface used throughout the application
 * - Error creation functions: Functions to create specific types of errors
 * - Error handling functions: Functions to handle and process errors
 * - ErrorHandler class: Static methods for common error handling operations
 * 
 * Usage:
 * ```typescript
 * import { 
 *   createAppError, 
 *   ErrorCategory, 
 *   ErrorSeverity,
 *   handleApiError 
 * } from '@/lib/error';
 * 
 * // Create a custom error
 * const error = createAppError(
 *   'Something went wrong',
 *   'custom/error-code',
 *   ErrorCategory.INTERNAL,
 *   ErrorSeverity.ERROR
 * );
 * 
 * // Handle an API error
 * try {
 *   // API call
 * } catch (error) {
 *   const appError = handleApiError(error);
 *   // Handle the error
 * }
 * ```
 */

// Error handler options interface
export interface ErrorHandler {
  // Whether to show a toast notification
  showToast?: boolean;
  // Context of where the error occurred (component, function, etc.)
  context?: string;
  // Action being performed when the error occurred
  action?: string;
  // User ID associated with the error
  userId?: string;
  // Function to set error message state in a component
  setErrorMessage?: (message: string | null) => void;
  // Any additional options
  [key: string]: any;
}

// Error codes for better error identification
export enum ErrorCode {
  // Auth errors
  AUTH_INVALID_CREDENTIALS = 'auth/invalid-credentials',
  AUTH_EMAIL_IN_USE = 'auth/email-already-in-use',
  AUTH_WEAK_PASSWORD = 'auth/weak-password',
  AUTH_INVALID_EMAIL = 'auth/invalid-email',
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_UNAUTHORIZED = 'auth/unauthorized',
  AUTH_ERROR = 'auth/error',
  AUTH_INVALID_TOKEN = 'auth/invalid-token',
  AUTH_OAUTH_ERROR = 'auth/oauth-error',
  AUTH_SESSION_EXPIRED = 'auth/session-expired',
  AUTH_EMAIL_NOT_VERIFIED = 'auth/email-not-verified',

  // Profile errors
  PROFILE_NOT_FOUND = 'profile/not-found',
  PROFILE_UPDATE_FAILED = 'profile/update-failed',
  PROFILE_ERROR = 'profile/error',
  PROFILE_CREATION_FAILED = 'profile/creation-failed',

  // Service errors
  SERVICE_NOT_FOUND = 'service/not-found',
  SERVICE_CREATE_FAILED = 'service/create-failed',
  SERVICE_UPDATE_FAILED = 'service/update-failed',
  SERVICE_ERROR = 'service/error',

  // Booking errors
  BOOKING_NOT_FOUND = 'booking/not-found',
  BOOKING_CREATE_FAILED = 'booking/create-failed',
  BOOKING_SLOT_UNAVAILABLE = 'booking/slot-unavailable',
  BOOKING_ERROR = 'booking/error',

  // API errors
  API_ERROR = 'api/error',
  API_TIMEOUT = 'api/timeout',
  API_RATE_LIMIT = 'api/rate-limit',
  API_BAD_REQUEST = 'api/bad-request',
  VALIDATION_REQUIRED = 'api/validation-required',
  VALIDATION_ERROR = 'api/validation-error',

  // General errors
  UNKNOWN_ERROR = 'general/unknown',
}

// Error categories for better error classification
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  INTERNAL = 'internal',
  NETWORK = 'network',
  DATABASE = 'database',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_SERVICE = 'external_service',
  USER_INPUT = 'user_input',
  SECURITY = 'security'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Standard application error interface
export interface AppError extends Error {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  source?: string;
  timestamp: Date;
}

/**
 * Check if an error is an AppError
 * @param error - The error to check
 * @returns Whether the error is an AppError
 */
export function isAppError(error: any): error is AppError {
  return (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    'message' in error &&
    'code' in error &&
    'category' in error &&
    'severity' in error
  );
}

/**
 * Convert any error to an AppError
 * @param error - The error to convert
 * @param source - The source of the error
 * @returns An AppError
 */
export function convertToAppError(error: any, source = 'unknown'): AppError {
  // If it's already an AppError, return it
  if (isAppError(error)) {
    return error;
  }

  // If it's an Error object
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: 'internal/unknown',
      category: ErrorCategory.INTERNAL,
      severity: ErrorSeverity.ERROR,
      details: {},
      source,
      timestamp: new Date()
    };
  }

  // If it's a string
  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
      code: 'internal/unknown',
      category: ErrorCategory.INTERNAL,
      severity: ErrorSeverity.ERROR,
      details: {},
      source,
      timestamp: new Date()
    };
  }

  // Default case
  return {
    name: 'Error',
    message: 'An unknown error occurred',
    code: 'internal/unknown',
    category: ErrorCategory.INTERNAL,
    severity: ErrorSeverity.ERROR,
    details: error || {},
    source,
    timestamp: new Date()
  };
}

/**
 * Create a standard AppError
 * @param message - The error message
 * @param code - The error code
 * @param category - The error category
 * @param severity - The error severity
 * @param details - Additional error details
 * @param source - The source of the error
 * @returns An AppError
 */
export function createAppError(
  message: string,
  code: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  details: Record<string, unknown> = {},
  source = 'unknown'
): AppError {
  return {
    name: 'AppError',
    message,
    code,
    category,
    severity,
    details,
    source,
    timestamp: new Date()
  };
}

/**
 * Create a validation error
 * @param message - The error message
 * @param details - Additional error details
 * @param source - The source of the error
 * @returns An AppError
 */
export function createValidationError(
  message: string,
  details: Record<string, unknown> = {},
  source = 'validation'
): AppError {
  return createAppError(
    message,
    'validation/invalid-input',
    ErrorCategory.VALIDATION,
    ErrorSeverity.WARNING,
    details,
    source
  );
}

/**
 * Create an authentication error
 * @param message - The error message
 * @param details - Additional error details
 * @param source - The source of the error
 * @returns An AppError
 */
export function createAuthError(
  message: string,
  details: Record<string, unknown> = {},
  source = 'auth'
): AppError {
  return createAppError(
    message,
    'auth/unauthorized',
    ErrorCategory.AUTHENTICATION,
    ErrorSeverity.WARNING,
    details,
    source
  );
}

/**
 * Create an authorization error
 * @param message - The error message
 * @param details - Additional error details
 * @param source - The source of the error
 * @returns An AppError
 */
export function createAuthorizationError(
  message: string,
  details: Record<string, unknown> = {},
  source = 'authorization'
): AppError {
  return createAppError(
    message,
    'auth/forbidden',
    ErrorCategory.AUTHORIZATION,
    ErrorSeverity.WARNING,
    details,
    source
  );
}

/**
 * Create a not found error
 * @param message - The error message
 * @param details - Additional error details
 * @param source - The source of the error
 * @returns An AppError
 */
export function createNotFoundError(
  message: string,
  details: Record<string, unknown> = {},
  source = 'not-found'
): AppError {
  return createAppError(
    message,
    'resource/not-found',
    ErrorCategory.NOT_FOUND,
    ErrorSeverity.WARNING,
    details,
    source
  );
}

/**
 * Create a database error
 * @param message - The error message
 * @param details - Additional error details
 * @param source - The source of the error
 * @returns An AppError
 */
export function createDatabaseError(
  message: string,
  details: Record<string, unknown> = {},
  source = 'database'
): AppError {
  return createAppError(
    message,
    'database/error',
    ErrorCategory.DATABASE,
    ErrorSeverity.ERROR,
    details,
    source
  );
}

/**
 * Create an internal error
 * @param message - The error message
 * @param details - Additional error details
 * @param source - The source of the error
 * @returns An AppError
 */
export function createInternalError(
  message: string,
  details: Record<string, unknown> = {},
  source = 'internal'
): AppError {
  return createAppError(
    message,
    'internal/error',
    ErrorCategory.INTERNAL,
    ErrorSeverity.ERROR,
    details,
    source
  );
}

/**
 * Create a rate limit error
 * @param message - The error message
 * @param details - Additional error details
 * @param source - The source of the error
 * @returns An AppError
 */
export function createRateLimitError(
  message: string,
  details: Record<string, unknown> = {},
  source = 'rate-limit'
): AppError {
  return createAppError(
    message,
    'rate-limit/exceeded',
    ErrorCategory.RATE_LIMIT,
    ErrorSeverity.WARNING,
    details,
    source
  );
}

/**
 * Get a status code for an error category
 * @param error - The error to get a status code for
 * @returns A status code
 */
export function getStatusCodeForError(error: AppError): number {
  switch (error.category) {
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
    case ErrorCategory.DATABASE:
    case ErrorCategory.INTERNAL:
      return 500;
    case ErrorCategory.NETWORK:
    case ErrorCategory.EXTERNAL_SERVICE:
      return 502;
    default:
      return 500;
  }
}

/**
 * Format an error for API response
 * @param error - The error to format
 * @returns A formatted error response
 */
export function formatErrorForResponse(error: any): {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
} {
  const appError = isAppError(error) ? error : convertToAppError(error);
  
  return {
    message: appError.message,
    code: appError.code,
    status: getStatusCodeForError(appError),
    details: appError.details
  };
}

/**
 * Handle an error in an API route
 * @param error - The error to handle
 * @returns A formatted error response with status code
 */
export function apiErrorHandler(error: any): {
  body: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  status: number;
} {
  const formattedError = formatErrorForResponse(error);
  
  return {
    body: {
      message: formattedError.message,
      code: formattedError.code,
      details: formattedError.details
    },
    status: formattedError.status
  };
}

/**
 * Handle an error
 * @param error - The error to handle
 * @param source - The source of the error
 * @returns An AppError
 */
export function handleError(error: any, source = 'unknown'): AppError {
  const appError = convertToAppError(error, source);
  
  // Log the error (you can add more sophisticated logging here)
  console.error(`[${appError.category}] ${appError.message}`, {
    code: appError.code,
    source: appError.source,
    details: appError.details,
    stack: appError.stack
  });
  
  return appError;
}

/**
 * ErrorHandler class for centralized error handling
 * This provides static methods for common error handling operations
 */
export class ErrorHandler {
  /**
   * Get a user-friendly error message
   * @param error - The error to get a message for
   * @returns A user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    const appError = this.convertToAppError(error);
    
    // Return different messages based on error category
    switch (appError.category) {
      case ErrorCategory.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please sign in again.';
      case ErrorCategory.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorCategory.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorCategory.NETWORK:
        return 'Network error. Please check your connection and try again.';
      case ErrorCategory.DATABASE:
        return 'Database error. Please try again later.';
      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please try again later.';
      case ErrorCategory.EXTERNAL_SERVICE:
        return 'External service error. Please try again later.';
      case ErrorCategory.USER_INPUT:
        return 'Invalid input. Please check your information and try again.';
      case ErrorCategory.SECURITY:
        return 'Security error. Please contact support.';
      case ErrorCategory.INTERNAL:
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  /**
   * Convert any error to an AppError
   * @param error - The error to convert
   * @param source - The source of the error
   * @returns An AppError
   */
  static convertToAppError(error: any, source = 'unknown'): AppError {
    return convertToAppError(error, source);
  }

  /**
   * Log an error to the console or error tracking service
   * @param error - The error to log
   */
  static logError(error: any): void {
    const appError = this.convertToAppError(error);
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ERROR]', {
        message: appError.message,
        code: appError.code,
        category: appError.category,
        severity: appError.severity,
        source: appError.source,
        details: appError.details,
        stack: appError.stack
      });
    } else {
      // In production, we could send to an error tracking service
      // Example: Sentry.captureException(appError);
      console.error('[ERROR]', appError.message);
    }
  }
}

/**
 * Handle API errors
 * @param error - The error to handle
 * @returns An AppError
 */
export function handleApiError(error: any): AppError {
  if (isAppError(error)) {
    return error;
  }
  if (error?.code) {
    return createAppError(
      error.message || 'API error',
      error.code,
      ErrorCategory.NETWORK,
      ErrorSeverity.ERROR,
      {},
      'api'
    );
  }
  return createAppError(
    error?.message || 'Unknown API error',
    ErrorCode.API_ERROR,
    ErrorCategory.NETWORK,
    ErrorSeverity.ERROR,
    {},
    'api'
  );
}

/**
 * Handle authentication errors
 * @param error - The error to handle
 * @returns An AppError
 */
export function handleAuthError(error: any): AppError {
  if (isAppError(error)) {
    return error;
  }
  
  // Check for specific auth error messages
  if (error?.message?.includes('Invalid login credentials')) {
    return createAppError(
      error.message,
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.WARNING,
      {},
      'auth'
    );
  }
  
  if (error?.message?.includes('User not found')) {
    return createAppError(
      error.message,
      ErrorCode.AUTH_USER_NOT_FOUND,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.WARNING,
      {},
      'auth'
    );
  }
  
  if (error?.message?.includes('Email already in use')) {
    return createAppError(
      error.message,
      ErrorCode.AUTH_EMAIL_IN_USE,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.WARNING,
      {},
      'auth'
    );
  }
  
  return createAppError(
    error?.message || 'Authentication error',
    ErrorCode.AUTH_ERROR,
    ErrorCategory.AUTHENTICATION,
    ErrorSeverity.WARNING,
    {},
    'auth'
  );
}

/**
 * Handle client-side errors
 * @param error - The error to handle
 * @returns An AppError
 */
export function handleClientError(error: any): AppError {
  if (isAppError(error)) {
    return error;
  }
  
  return createAppError(
    error?.message || 'Client error',
    ErrorCode.UNKNOWN_ERROR,
    ErrorCategory.INTERNAL,
    ErrorSeverity.ERROR,
    {},
    'client'
  );
} 