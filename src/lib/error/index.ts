/**
 * Error handling module
 * Provides utilities for handling errors consistently throughout the application
 */

// Export auth error utilities from auth-error-utils
export {
    appErrorToAuthError,
    authErrorToAppError,
    convertToAuthError,
    toAuthError
} from './auth-error-utils';

// Export auth error handler utilities
export {
    checkOnlineStatus, getAuthErrorMessage,
    handleAuthError, withAuthErrorHandling
} from './auth-error-handler';

// Export error boundary component
export { ErrorBoundary } from './error-boundary';

// Export error handler and logger
export {
    ErrorCategory,
    ErrorSeverity, createAppError, isAppError
} from './error-handler';
export { logError } from './error-logger';

// Export try/catch utility
export { tryCatch, tryCatchWithRetry } from './try-catch';

