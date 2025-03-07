/**
 * PointMe Hooks
 * 
 * This file exports all hooks from the application in an organized manner.
 * Hooks are categorized by their primary purpose to make imports cleaner.
 */

// Re-export all hooks from their respective categories
export * from './api';
export * from './core';
export * from './supabase';
export * from './ui';

// For backwards compatibility - direct re-exports of commonly used hooks
// This allows existing code to continue working without immediate changes
export { useApi } from './api';
export { useForm } from './core';
export { useToast } from './ui';

// Export auth hooks
export { useAuth } from './auth';
export type { AuthProfile } from './auth';

