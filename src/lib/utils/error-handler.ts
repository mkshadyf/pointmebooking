import { showToast } from '@/components/ui/Toast';
import { AuthError } from '@/types/database/auth';
import { PostgrestError } from '@supabase/supabase-js';

// Centralized error type definitions
export type ErrorCode = 
    | 'auth/invalid-credentials'
    | 'auth/email-in-use'
    | 'auth/weak-password'
    | 'auth/invalid-email'
    | 'auth/user-not-found'
    | 'auth/too-many-requests'
    | 'auth/expired-session'
    | 'auth/unauthorized'
    | 'auth/verification-failed'
    | 'auth/password-mismatch'
    | 'auth/invalid-token'
    | 'auth/session-expired'
    | 'profile/update-failed'
    | 'profile/not-found'
    | 'profile/invalid-data'
    | 'profile/duplicate-email'
    | 'profile/incomplete'
    | 'validation/required'
    | 'validation/invalid'
    | 'validation/too-short'
    | 'validation/too-long'
    | 'validation/password-weak'
    | 'validation/email-invalid'
    | 'validation/phone-invalid'
    | 'network/offline'
    | 'network/timeout'
    | 'network/connection-lost'
    | 'server/error'
    | 'server/maintenance'
    | 'server/rate-limit'
    | 'server/database-error'
    | 'payment/failed'
    | 'payment/invalid-card'
    | 'payment/insufficient-funds'
    | 'booking/slot-taken'
    | 'booking/invalid-time'
    | 'booking/past-date'
    | 'service/not-found'
    | 'service/unavailable'
    | 'service/invalid-price';

export const ERROR_CODES: Record<string, ErrorCode> = {
    // Auth Errors
    AUTH_INVALID_CREDENTIALS: 'auth/invalid-credentials',
    AUTH_EMAIL_IN_USE: 'auth/email-in-use',
    AUTH_WEAK_PASSWORD: 'auth/weak-password',
    AUTH_INVALID_EMAIL: 'auth/invalid-email',
    AUTH_USER_NOT_FOUND: 'auth/user-not-found',
    AUTH_TOO_MANY_REQUESTS: 'auth/too-many-requests',
    AUTH_EXPIRED_SESSION: 'auth/expired-session',
    AUTH_UNAUTHORIZED: 'auth/unauthorized',
    AUTH_VERIFICATION_FAILED: 'auth/verification-failed',
    AUTH_PASSWORD_MISMATCH: 'auth/password-mismatch',
    AUTH_INVALID_TOKEN: 'auth/invalid-token',
    AUTH_SESSION_EXPIRED: 'auth/session-expired',
    
    // Profile Errors
    PROFILE_UPDATE_FAILED: 'profile/update-failed',
    PROFILE_NOT_FOUND: 'profile/not-found',
    PROFILE_INVALID_DATA: 'profile/invalid-data',
    PROFILE_DUPLICATE_EMAIL: 'profile/duplicate-email',
    PROFILE_INCOMPLETE: 'profile/incomplete',
    
    // Validation Errors
    VALIDATION_REQUIRED: 'validation/required',
    VALIDATION_INVALID: 'validation/invalid',
    VALIDATION_TOO_SHORT: 'validation/too-short',
    VALIDATION_TOO_LONG: 'validation/too-long',
    VALIDATION_PASSWORD_WEAK: 'validation/password-weak',
    VALIDATION_EMAIL_INVALID: 'validation/email-invalid',
    VALIDATION_PHONE_INVALID: 'validation/phone-invalid',
    
    // Network Errors
    NETWORK_OFFLINE: 'network/offline',
    NETWORK_TIMEOUT: 'network/timeout',
    NETWORK_CONNECTION_LOST: 'network/connection-lost',
    
    // Server Errors
    SERVER_ERROR: 'server/error',
    SERVER_MAINTENANCE: 'server/maintenance',
    SERVER_RATE_LIMIT: 'server/rate-limit',
    SERVER_DATABASE_ERROR: 'server/database-error',
    
    // Payment Errors
    PAYMENT_FAILED: 'payment/failed',
    PAYMENT_INVALID_CARD: 'payment/invalid-card',
    PAYMENT_INSUFFICIENT_FUNDS: 'payment/insufficient-funds',
    
    // Booking Errors
    BOOKING_SLOT_TAKEN: 'booking/slot-taken',
    BOOKING_INVALID_TIME: 'booking/invalid-time',
    BOOKING_PAST_DATE: 'booking/past-date',
    
    // Service Errors
    SERVICE_NOT_FOUND: 'service/not-found',
    SERVICE_UNAVAILABLE: 'service/unavailable',
    SERVICE_INVALID_PRICE: 'service/invalid-price'
} as const;

export const USER_MESSAGES: Record<ErrorCode, string> = {
    'auth/invalid-credentials': 'Invalid email or password. Please try again.',
    'auth/email-in-use': 'This email is already registered. Try logging in instead.',
    'auth/weak-password': 'Password must include at least 8 characters with numbers and special characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'Account not found. Please check your email or sign up.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/expired-session': 'Your session has expired. Please log in again.',
    'auth/unauthorized': 'You are not authorized to perform this action.',
    'auth/verification-failed': 'Email verification failed. Please try again.',
    'auth/password-mismatch': 'Passwords do not match. Please try again.',
    'auth/invalid-token': 'Invalid or expired token. Please request a new one.',
    'auth/session-expired': 'Your session has expired. Please log in again.',
    'profile/update-failed': 'Failed to update profile. Please try again.',
    'profile/not-found': 'Profile not found. Please complete your registration.',
    'profile/invalid-data': 'Invalid profile data. Please check your input.',
    'profile/duplicate-email': 'This email is already in use. Please use a different one.',
    'profile/incomplete': 'Please complete your profile before continuing.',
    'validation/required': 'This field is required.',
    'validation/invalid': 'Invalid input. Please check your data.',
    'validation/too-short': 'Input is too short.',
    'validation/too-long': 'Input is too long.',
    'validation/password-weak': 'Password is too weak. Please make it stronger.',
    'validation/email-invalid': 'Please enter a valid email address.',
    'validation/phone-invalid': 'Please enter a valid phone number.',
    'network/offline': 'You appear to be offline. Please check your internet connection.',
    'network/timeout': 'Request timed out. Please try again.',
    'network/connection-lost': 'Connection lost. Please check your internet and try again.',
    'server/error': 'Server error. Please try again later.',
    'server/maintenance': 'System is under maintenance. Please try again later.',
    'server/rate-limit': 'Too many requests. Please wait a moment and try again.',
    'server/database-error': 'Database error. Please try again later.',
    'payment/failed': 'Payment failed. Please try again or use a different payment method.',
    'payment/invalid-card': 'Invalid card details. Please check and try again.',
    'payment/insufficient-funds': 'Insufficient funds. Please use a different payment method.',
    'booking/slot-taken': 'This time slot is no longer available. Please choose another.',
    'booking/invalid-time': 'Invalid booking time. Please select a valid time slot.',
    'booking/past-date': 'Cannot book for past dates. Please select a future date.',
    'service/not-found': 'Service not found. It may have been removed or is unavailable.',
    'service/unavailable': 'This service is currently unavailable.',
    'service/invalid-price': 'Invalid service price. Please contact support.'
};

export interface ErrorHandlerOptions {
    showToast?: boolean;
    logError?: boolean;
    throwError?: boolean;
    context?: string;
    errorData?: Record<string, unknown>;
}

export interface ErrorResponse {
    code: ErrorCode;
    message: string;
    details: Record<string, unknown>;
}

export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  SERVER = 'server',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

export class AppError extends Error {
  type: ErrorType;
  originalError?: unknown;
  statusCode?: number;
  context?: Record<string, unknown>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    originalError?: unknown,
    statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.statusCode = statusCode;
    this.context = context;
    
    // Ensures proper stack trace in modern JS engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  get userMessage(): string {
    // Map error types to user-friendly messages
    switch (this.type) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials and try again.';
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.CONFLICT:
        return 'This operation cannot be completed due to a conflict.';
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      case ErrorType.NETWORK:
        return 'Network error. Please check your connection and try again.';
      default:
        return this.message || 'An unexpected error occurred. Please try again.';
    }
  }
}

// Centralized error handler class
export class ErrorHandler {
    // Main error handling method
    static async handle(
        error: Error | AuthError | unknown,
        options: ErrorHandlerOptions = {
            showToast: true,
            logError: true,
            throwError: false
        }
    ): Promise<ErrorResponse> {
        const { showToast: shouldShowToast, logError, throwError, context, errorData } = options;
        
        // Convert to AppError for consistent handling
        const appError = this.convertToAppError(error, context);
        
        // Get user-friendly message
        const userMessage = this.getUserFriendlyMessage(appError);
        
        // Show user feedback if requested
        if (shouldShowToast) {
            this.showErrorToast(appError, userMessage);
        }
        
        // Log error if requested
        if (logError) {
            await this.logError(appError, context);
        }
        
        // Throw error if requested
        if (throwError) {
            throw appError;
        }
        
        // Return standardized error response
        return {
            code: this.getErrorCode(appError),
            message: userMessage,
            details: {
                type: appError.type,
                originalMessage: appError.message,
                statusCode: appError.statusCode,
                context: appError.context,
                ...errorData
            }
        };
    }
    
    // Convert any error to AppError for consistent handling
    static convertToAppError(error: unknown, context?: string): AppError {
        // Already an AppError
        if (error instanceof AppError) {
            return error;
        }
        
        // Handle Error objects
        if (error instanceof Error) {
            const authError = error as AuthError;
            
            // Handle auth errors
            if (this.isAuthError(error)) {
                return new AppError(
                    authError.message,
                    ErrorType.AUTHENTICATION,
                    error,
                    authError.status,
                    { context, code: authError.code }
                );
            }
            
            // Handle network errors
            if (this.isNetworkError(error)) {
                return new AppError(
                    error.message,
                    ErrorType.NETWORK,
                    error,
                    undefined,
                    { context }
                );
            }
            
            // Handle validation errors
            if (this.isValidationError(error)) {
                return new AppError(
                    error.message,
                    ErrorType.VALIDATION,
                    error,
                    400,
                    { context }
                );
            }
            
            // Handle Supabase PostgrestError
            if ('code' in error && 'message' in error && 'details' in error) {
                return this.handleSupabaseError(error as PostgrestError);
            }
            
            // Default Error handling
            return new AppError(
                error.message,
                ErrorType.UNKNOWN,
                error,
                undefined,
                { context }
            );
        }
        
        // Handle non-Error objects
        return new AppError(
            typeof error === 'string' ? error : 'Unknown error occurred',
            ErrorType.UNKNOWN,
            error,
            undefined,
            { context }
        );
    }
    
    // Get user-friendly error message
    static getUserFriendlyMessage(error: AppError): string {
        // If we have a specific error code, use its message
        const errorCode = this.getErrorCode(error);
        if (errorCode && USER_MESSAGES[errorCode]) {
            return USER_MESSAGES[errorCode];
        }
        
        // Otherwise use the AppError's user message
        return error.userMessage;
    }
    
    // Show error toast notification
    static showErrorToast(error: AppError, message: string): void {
        showToast({
            type: 'error',
            title: this.getErrorTitle(error.type),
            message,
            duration: 5000,
            position: 'top-right',
            dismissible: true
        });
    }
    
    // Log error to console and optionally to server
    static async logError(error: AppError, context?: string): Promise<void> {
        // Console logging
        console.error('Error occurred:', {
            type: error.type,
            message: error.message,
            userMessage: error.userMessage,
            statusCode: error.statusCode,
            context: error.context || context,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // Server logging (if available)
        try {
            await fetch('/api/log/error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: error.type,
                    message: error.message,
                    userMessage: error.userMessage,
                    statusCode: error.statusCode,
                    context: error.context || context,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (logError) {
            console.error('Failed to log error to server:', logError);
        }
    }
    
    // Get error title based on error type
    static getErrorTitle(errorType: ErrorType): string {
        switch (errorType) {
            case ErrorType.AUTHENTICATION:
                return 'Authentication Error';
            case ErrorType.AUTHORIZATION:
                return 'Authorization Error';
            case ErrorType.VALIDATION:
                return 'Validation Error';
            case ErrorType.NOT_FOUND:
                return 'Not Found';
            case ErrorType.CONFLICT:
                return 'Conflict Error';
            case ErrorType.SERVER:
                return 'Server Error';
            case ErrorType.NETWORK:
                return 'Network Error';
            default:
                return 'Error';
        }
    }
    
    // Get error code from AppError
    static getErrorCode(error: AppError): ErrorCode {
        // Check if we have a code in the context
        if (error.context && 'code' in error.context && typeof error.context.code === 'string') {
            const code = error.context.code as string;
            if (Object.values(ERROR_CODES).includes(code as ErrorCode)) {
                return code as ErrorCode;
            }
        }
        
        // Map error types to default error codes
        switch (error.type) {
            case ErrorType.AUTHENTICATION:
                return 'auth/unauthorized';
            case ErrorType.AUTHORIZATION:
                return 'auth/unauthorized';
            case ErrorType.VALIDATION:
                return 'validation/invalid';
            case ErrorType.NOT_FOUND:
                return 'server/error';
            case ErrorType.CONFLICT:
                return 'server/error';
            case ErrorType.SERVER:
                return 'server/error';
            case ErrorType.NETWORK:
                return 'network/connection-lost';
            default:
                return 'server/error';
        }
    }
    
    // Error type checking methods
    static isNetworkError(error: Error): boolean {
        return error instanceof TypeError || 
               error.name === 'NetworkError' || 
               error.name === 'AbortError' ||
               error.message.includes('network') ||
               error.message.includes('connection');
    }
    
    static isAuthError(error: Error): boolean {
        const authError = error as AuthError;
        return !!authError.code?.startsWith('auth/') || 
               error.message.includes('auth') || 
               error.message.includes('token') || 
               error.message.includes('login') ||
               error.message.includes('password') ||
               error.message.includes('credential');
    }
    
    static isValidationError(error: Error): boolean {
        return error.message.includes('validation') || 
               error.message.includes('invalid') || 
               error.message.includes('required');
    }
    
    static isPaymentError(error: Error): boolean {
        return error.message.includes('payment') || 
               error.message.includes('card') || 
               error.message.includes('transaction');
    }
    
    static isBookingError(error: Error): boolean {
        return error.message.includes('booking') || 
               error.message.includes('appointment') || 
               error.message.includes('schedule');
    }
    
    static isServiceError(error: Error): boolean {
        return error.message.includes('service');
    }
    
    // Handle Supabase specific errors
    static handleSupabaseError(error: PostgrestError): AppError {
        // Map Supabase error codes to our error types
        let errorType = ErrorType.UNKNOWN;
        let statusCode = 500;
        
        if (error.code === '23505') {
            // Unique violation
            errorType = ErrorType.CONFLICT;
            statusCode = 409;
        } else if (error.code === '23503') {
            // Foreign key violation
            errorType = ErrorType.VALIDATION;
            statusCode = 400;
        } else if (error.code === '42P01') {
            // Undefined table
            errorType = ErrorType.SERVER;
            statusCode = 500;
        } else if (error.code === '42703') {
            // Undefined column
            errorType = ErrorType.SERVER;
            statusCode = 500;
        } else if (error.code === '28000' || error.code === '28P01') {
            // Invalid authorization
            errorType = ErrorType.AUTHENTICATION;
            statusCode = 401;
        } else if (error.code === '3D000') {
            // Database does not exist
            errorType = ErrorType.SERVER;
            statusCode = 500;
        } else if (error.code === '3F000') {
            // Schema does not exist
            errorType = ErrorType.SERVER;
            statusCode = 500;
        } else if (error.code === '42501') {
            // Insufficient privilege
            errorType = ErrorType.AUTHORIZATION;
            statusCode = 403;
        } else if (error.code === '22P02') {
            // Invalid text representation
            errorType = ErrorType.VALIDATION;
            statusCode = 400;
        }
        
        return new AppError(
            error.message,
            errorType,
            error,
            statusCode,
            { code: error.code, details: error.details }
        );
    }
}

// Convenience function for handling errors
export function handleError(error: unknown, options?: ErrorHandlerOptions): Promise<ErrorResponse> {
    return ErrorHandler.handle(error, options);
}

// Convenience function for getting user-friendly error messages
export function getUserFriendlyErrorMessage(error: unknown): string {
    const appError = ErrorHandler.convertToAppError(error);
    return ErrorHandler.getUserFriendlyMessage(appError);
}

// Convenience function for logging errors
export function logError(error: unknown, context?: string): void {
    const appError = ErrorHandler.convertToAppError(error, context);
    ErrorHandler.logError(appError, context);
}