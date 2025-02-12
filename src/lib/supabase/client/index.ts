// Browser client exports
export { createClient, supabase } from './browser';

// Server client exports
export {
    createServerSupabaseClient, getSession, getUser, getUserProfile
} from './server';

// Type exports
export type { Database } from '../types/database';
export type SupabaseClient = ReturnType<typeof createClient>; 