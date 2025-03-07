/**
 * Auth hooks module
 * Provides consistent auth hooks for the entire application
 */

// Export the main hooks
export { useAuth } from './useAuth';
 
// Export the hook as default export for convenience
export { useAuth as default } from './useAuth';

// Re-export the AuthProfile type from types for convenience
export type { AuthProfile } from '@/types/auth';

