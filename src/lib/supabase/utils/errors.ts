/**
 * Error utilities for Supabase
 * Re-exports error handling functions from the main error module
 */

import {
    AppError,
    handleApiError as handleApiErrorOriginal,
    handleAuthError as handleAuthErrorOriginal,
    handleClientError as handleClientErrorOriginal
} from '@/lib/error/error-handler';

// Re-export error handling functions
export const handleApiError = handleApiErrorOriginal;
export const handleAuthError = handleAuthErrorOriginal;
export const handleClientError = handleClientErrorOriginal;

// Re-export AppError type
export type { AppError };
