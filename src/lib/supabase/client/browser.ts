/**
 * Browser-specific Supabase client
 * This file provides a consistent interface for accessing Supabase in browser contexts
 */

import { Database } from '@/types/database/generated.types';
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a browser client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Export the createBrowserClient function for consistency
export const createBrowserClient = () => {
  return supabase;
};
