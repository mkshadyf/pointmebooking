/**
 * Supabase client exports
 * This file provides a consistent interface for accessing Supabase clients
 */

import { CookieContainer, createBrowserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/client';

// Re-export the client creation functions
export { createBrowserSupabaseClient, createServerSupabaseClient };
export type { CookieContainer };

// Export a type for the Supabase client
export type TypedSupabaseClient = ReturnType<typeof createBrowserSupabaseClient>;

// Create a browser client for direct imports
export const supabase = createBrowserSupabaseClient();

// Create a server client function for server components
export const getServerClient = async (cookieStore: CookieContainer) => {
  return await createServerSupabaseClient(cookieStore);
}; 