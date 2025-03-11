/**
 * Error handling utilities
 * 
 * @deprecated This module is being replaced by the new core error service.
 * Please use @/lib/core/error instead.
 */

// Re-export the new error service
export { ErrorService } from '@/lib/core/error';

// Export the compatibility layer for backward compatibility
export { logError } from '@/lib/core/compat/error-compat';

// Export types from the error-logger for backward compatibility
export {
    ErrorCategory,
    ErrorCode,
    ErrorHandler, ErrorSeverity, ErrorType, convertToAppError,
    isAppError
} from '@/lib/core/compat/error-compat';

// Export the try-catch utility
export { tryCatch, tryCatchWithRetry } from './try-catch';

// Export the auth error utilities
export {
    appErrorToAuthError,
    authErrorToAppError, convertToAuthError,
    toAuthError
} from './auth-error-utils';

// Export the error boundary
// Note: If error-boundary.tsx exports a class component, use this:
export * from './error-boundary';

// Export other utilities
// Note: This is redundant now that we're exporting everything from auth-error-utils above
// Keeping it for now to avoid breaking changes
// export * from './auth-error-utils';

