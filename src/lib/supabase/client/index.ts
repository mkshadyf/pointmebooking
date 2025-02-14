import { createClient } from './browser';

// Browser client exports
export { createClient, supabase } from './browser';

// Server client exports
 

// Type exports
export type { Database } from '../types/database';
export type SupabaseClient = ReturnType<typeof createClient>; 