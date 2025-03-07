/**
 * Supabase Hooks - React hooks for Supabase integrations
 * 
 * This file exports hooks for various Supabase features including
 * authentication, storage, realtime subscriptions, and business metrics.
 */

// Re-export all hooks from subdirectories
export * from './auth';
export * from './realtime';
export * from './storage';

// Business/application specific hooks
export { useBusinessMetrics } from './useBusinessMetrics';
export { useRecentActivity } from './useRecentActivity';

