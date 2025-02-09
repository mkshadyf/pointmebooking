import { showToast } from '@/components/ToastHost';
import { AuthError } from '@supabase/supabase-js';
import { ZodError } from 'zod';
import { BaseError, ErrorCode, ErrorMessageMap, ErrorStatusMap } from './types';

// Application error class
export class AppError extends Error implements BaseError {
  code: string;
  status: number;
  context?: Record<string, any>;

  constructor(code: ErrorCode, context?: Record<string, any>) {
    super(ErrorMessageMap[code]);
    this.code = code;
    this.status = ErrorStatusMap[code];
    this.context = context;
    this.name = 'AppError';
  }
}

// Create an error instance
export function createError(code: ErrorCode, context?: Record<string, any>): AppError {
  return new AppError(code, context);
}

// Handle Zod validation errors
export function handleValidationError(error: ZodError): AppError {
  return createError(ErrorCode.VALIDATION_ERROR, {
    details: error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }))
  });
}

// Handle Supabase auth errors
export function handleAuthError(error: unknown): string {
  const defaultMessage = 'Authentication failed. Please try again.';
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('email') || message.includes('user')) {
      return 'Invalid email address';
    }
    if (message.includes('password')) {
      return 'Incorrect password';
    }
    if (message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
  }
  
  return defaultMessage;
}

// Handle database errors
export function handleDatabaseError(error: any): AppError {
  // Supabase specific error codes
  if (error?.code === '23505') { // Unique violation
    return createError(ErrorCode.DB_DUPLICATE_ENTRY);
  }
  if (error?.code === '23503') { // Foreign key violation
    return createError(ErrorCode.DB_QUERY_FAILED);
  }
  if (error?.code?.startsWith('28')) { // Authorization/authentication errors
    return createError(ErrorCode.AUTH_UNAUTHORIZED);
  }
  if (error?.code?.startsWith('42')) { // Syntax error or access rule violation
    return createError(ErrorCode.DB_QUERY_FAILED, { details: error.message });
  }
  
  return createError(ErrorCode.DB_QUERY_FAILED, { details: error.message });
}

// Handle storage errors
export function handleStorageError(error: any): AppError {
  if (error?.statusCode === 404) {
    return createError(ErrorCode.STORAGE_FILE_NOT_FOUND);
  }
  if (error?.statusCode === 413) {
    return createError(ErrorCode.STORAGE_INVALID_FILE);
  }
  return createError(ErrorCode.STORAGE_UPLOAD_FAILED, { details: error.message });
}

// Generic error handler
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof ZodError) {
    return handleValidationError(error);
  }
  if (error instanceof AuthError) {
    return createError(ErrorCode.UNKNOWN_ERROR, { details: handleAuthError(error) });
  }
  if (error instanceof Error) {
    return createError(ErrorCode.UNKNOWN_ERROR, { details: error.message });
  }
  return createError(ErrorCode.UNKNOWN_ERROR);
}

// API response error handler
export function handleApiError(error: unknown): Response {
  const appError = handleError(error);
  return new Response(
    JSON.stringify({
      error: {
        code: appError.code,
        message: appError.message,
        context: appError.context
      }
    }),
    {
      status: appError.status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Client-side error handler with toast notifications
export async function handleClientError(error: unknown): Promise<void> {
  const appError = handleError(error);
  
  showToast.error(appError.message);
  
  // Log error to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement error logging service
    console.error('Error:', {
      code: appError.code,
      message: appError.message,
      context: appError.context,
      stack: appError.stack
    });
  }
}

export const handleProfileError = (error: unknown) => {
  console.error('Profile error:', error);
  return 'Failed to update profile. Please try again.';
}; 