/**
 * Authentication hooks for handling user authentication and authorization
 * 
 * This module exports the canonical authentication hooks that should be used
 * throughout the application.
 */

// Export the main hooks
export { useAuth } from './useAuth';
export type { UseAuthOptions, UseAuthReturn } from './useAuth';

// Export the hook as default export for convenience
export { useAuth as default } from './useAuth';

// Re-export the AuthProfile type from types for convenience
export type { AuthProfile } from '@/types/auth';

