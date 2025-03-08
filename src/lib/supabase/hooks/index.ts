/**
 * @deprecated These hooks are deprecated in favor of hooks from @/hooks/auth, @/hooks/core, etc.
 * Use the hooks in their respective domain folders instead.
 */

// Export realtime hooks
export * from './useSupabaseRealtime';

// Export storage hooks
export * from './useSupabaseStorage';

// Export metrics hooks
export * from './useBusinessMetrics';
export * from './useRecentActivity';
export { useAuth };

// Re-export auth hooks directly from the canonical location
    import { useAuth } from '@/hooks/auth';

