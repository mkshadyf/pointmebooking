/**
 * Compatibility layer for the error service
 * 
 * This file provides backward compatibility with the old error-logger module
 * to ease the transition to the new core services.
 */

import { ErrorService } from '../error';

/**
 * Compatibility function for logError
 * 
 * @deprecated Use ErrorService.handleError instead
 */
export async function logError(error: any, userId?: string, context?: Record<string, any>): Promise<void> {
  ErrorService.handleError(error, {
    context: 'Error Logger',
    additionalData: {
      userId,
      ...context
    }
  });
}

/**
 * Compatibility function for tryCatch
 * 
 * @deprecated Use try/catch with ErrorService.handleError instead
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => void,
  context?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const normalizedError = ErrorService.handleError(error, {
      context: context || 'Try Catch',
    });
    
    if (errorHandler) {
      errorHandler(normalizedError);
    }
    
    return null;
  }
}

/**
 * Re-export error types for compatibility
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  EXTERNAL = 'external',
  DATABASE = 'database',
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  UNEXPECTED = 'unexpected',
  INPUT = 'input',
  RESOURCE = 'resource',
  SERVER = 'server',
  BUSINESS_LOGIC = 'business_logic'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  UI = 'ui',
  FORM = 'form',
  API = 'api',
  AUTH = 'auth',
  DATA = 'data',
  SYSTEM = 'system',
  SECURITY = 'security',
  BUSINESS = 'business'
}

/**
 * Additional compatibility exports
 */
export enum ErrorCode {
  // General error codes
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  NOT_FOUND_ERROR = 'not_found_error',
  CONFLICT_ERROR = 'conflict_error',
  EXTERNAL_ERROR = 'external_error',
  DATABASE_ERROR = 'database_error',
  NETWORK_ERROR = 'network_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  UNEXPECTED_ERROR = 'unexpected_error',
  INPUT_ERROR = 'input_error',
  RESOURCE_ERROR = 'resource_error',
  SERVER_ERROR = 'server_error',
  BUSINESS_LOGIC_ERROR = 'business_logic_error',
  UNKNOWN_ERROR = 'unknown_error',
  
  // Auth specific error codes
  AUTH_INVALID_CREDENTIALS = 'auth_invalid_credentials',
  AUTH_EMAIL_IN_USE = 'auth_email_in_use',
  AUTH_WEAK_PASSWORD = 'auth_weak_password',
  AUTH_INVALID_EMAIL = 'auth_invalid_email',
  AUTH_USER_NOT_FOUND = 'auth_user_not_found',
  AUTH_UNAUTHORIZED = 'auth_unauthorized',
  AUTH_ERROR = 'auth_error',
  AUTH_INVALID_TOKEN = 'auth_invalid_token',
  AUTH_OAUTH_ERROR = 'auth_oauth_error',
  AUTH_SESSION_EXPIRED = 'auth_session_expired',
  AUTH_EMAIL_NOT_VERIFIED = 'auth_email_not_verified',
  
  // Profile specific error codes
  PROFILE_NOT_FOUND = 'profile_not_found',
  PROFILE_UPDATE_FAILED = 'profile_update_failed',
  PROFILE_ERROR = 'profile_error',
  PROFILE_CREATION_FAILED = 'profile_creation_failed',
  
  // Service specific error codes
  SERVICE_NOT_FOUND = 'service_not_found',
  SERVICE_CREATE_FAILED = 'service_create_failed',
  SERVICE_UPDATE_FAILED = 'service_update_failed',
  SERVICE_ERROR = 'service_error',
  
  // Booking specific error codes
  BOOKING_NOT_FOUND = 'booking_not_found',
  BOOKING_CREATE_FAILED = 'booking_create_failed',
  BOOKING_SLOT_UNAVAILABLE = 'booking_slot_unavailable',
  BOOKING_ERROR = 'booking_error',
  
  // API specific error codes
  API_ERROR = 'api_error',
  API_TIMEOUT = 'api_timeout',
  API_RATE_LIMIT = 'api_rate_limit',
  API_BAD_REQUEST = 'api_bad_request',
  
  // Validation specific error codes
  VALIDATION_REQUIRED = 'validation_required'
}

export interface AppError extends Error {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: Record<string, any>;
  timestamp: string;
}

export const ErrorHandler = {
  handleError: (error: any, context?: string) => {
    return ErrorService.handleError(error, { context });
  },
  
  getUserFriendlyMessage: (error: any): string => {
    if (isAppError(error)) {
      // Return a user-friendly message based on the error code
      switch (error.code) {
        case ErrorCode.VALIDATION_ERROR:
          return 'Please check your input and try again.';
        case ErrorCode.AUTHENTICATION_ERROR:
          return 'Authentication failed. Please sign in again.';
        case ErrorCode.AUTHORIZATION_ERROR:
          return 'You do not have permission to perform this action.';
        case ErrorCode.NOT_FOUND_ERROR:
          return 'The requested resource was not found.';
        case ErrorCode.CONFLICT_ERROR:
          return 'This operation cannot be completed due to a conflict.';
        case ErrorCode.NETWORK_ERROR:
          return 'Network error. Please check your connection and try again.';
        case ErrorCode.RATE_LIMIT_ERROR:
          return 'Too many requests. Please try again later.';
        case ErrorCode.UNEXPECTED_ERROR:
          return 'An unexpected error occurred. Please try again.';
        default:
          return error.message || 'An error occurred.';
      }
    }
    
    // If not an AppError, return a generic message
    return error?.message || 'An error occurred.';
  }
};

export const convertToAppError = (error: any, category: ErrorCategory = ErrorCategory.SYSTEM): AppError => {
  const appError = {
    name: error.name || 'Error',
    message: error.message || 'An unexpected error occurred',
    code: error.code || ErrorCode.UNEXPECTED_ERROR,
    category,
    severity: ErrorSeverity.MEDIUM,
    details: error.details || {},
    timestamp: new Date().toISOString(),
    stack: error.stack
  } as AppError;
  
  return appError;
};

export const isAppError = (error: any): error is AppError => {
  return error && 
    typeof error === 'object' && 
    'code' in error && 
    'category' in error && 
    'severity' in error;
}; 