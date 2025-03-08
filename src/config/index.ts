export type { NavigationItem } from '../routes';
export * from './env';
export * from './routes';
export * from './supabase';

/**
 * Re-export routes from the main routes file
 * This file exists to maintain compatibility with imports from config/routes
 */
export * from '../routes';

