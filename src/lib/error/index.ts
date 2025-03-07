/**
 * Error Module
 * 
 * This module provides comprehensive error handling features.
 * It includes error types, error handling utilities, error boundary components,
 * and error conversion utilities.
 */

// Error Types
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

// Error Classes
export {
  convertToAppError, createAppError,
  ErrorCode, ErrorHandler,
  handleApiError, handleError, isAppError
} from './error-handler';
export type { AppError } from './error-handler';

// Error Boundary Components
export {
  ErrorBoundary, ErrorPage, withErrorBoundary
} from './error-boundary';

// Auth Error Utilities
export {
  appErrorToAuthError,
  authErrorToAppError,
  convertToAuthError,
  toAuthError
} from './auth-error-utils';

// Error Interfaces
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  status: number;
}

export interface FormErrorResponse {
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
}

export interface AppErrorOptions {
  cause?: Error | unknown;
  context?: string;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  details?: Record<string, any>;
}

export interface AppErrorMetadata {
  timestamp: string;
  requestId?: string;
  userId?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
}

export interface FormError {
  field: string;
  message: string;
}

export type FormErrors = FormError[];
