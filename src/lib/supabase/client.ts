/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the SupabaseClientService singleton from '@/lib/supabase/services/core/supabase-client.service' instead.
 */

import { Database } from '@/types/database/generated.types';
import { createClient } from '@supabase/supabase-js';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Define a type for cookie containers that works with both server and client components
export type CookieContainer = 
  | RequestCookies 
  | ReadonlyRequestCookies 
  | { get: (name: string) => { value?: string } | undefined }
  | { get: (name: string) => string | undefined };

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a browser client
export const createBrowserSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

// Create a server client
export const createServerSupabaseClient = async (cookieStore: CookieContainer) => {
  // Get the supabase token from cookies
  const accessTokenCookie = cookieStore.get('sb-access-token');
  const refreshTokenCookie = cookieStore.get('sb-refresh-token');
  
  // Extract the token values, handling both string and object formats
  const supabaseToken = typeof accessTokenCookie === 'object' && accessTokenCookie?.value 
    ? accessTokenCookie.value 
    : typeof accessTokenCookie === 'string' ? accessTokenCookie : '';
    
  const supabaseRefreshToken = typeof refreshTokenCookie === 'object' && refreshTokenCookie?.value
    ? refreshTokenCookie.value
    : typeof refreshTokenCookie === 'string' ? refreshTokenCookie : '';
  
  // Create a client with the token
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: supabaseToken ? `Bearer ${supabaseToken}` : '',
      },
    },
  });
  
  // If we have a refresh token, try to refresh the session
  if (supabaseRefreshToken) {
    try {
      await client.auth.refreshSession({
        refresh_token: supabaseRefreshToken,
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }
  
  return client;
};

