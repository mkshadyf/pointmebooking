'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_CONFIG, SUPABASE_URL } from '../config';
import type { Database } from '../types/database';

export const createClient = () => {
  return createBrowserClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name: string, value: string, options = SUPABASE_CONFIG.AUTH.COOKIE_OPTIONS) {
          document.cookie = `${name}=${value}; path=${options.path}; max-age=${options.maxAge}; ${
            options.secure ? 'secure;' : ''
          } samesite=${options.sameSite};`;
        },
        remove(name: string, options = SUPABASE_CONFIG.AUTH.COOKIE_OPTIONS) {
          document.cookie = `${name}=; path=${options.path}; max-age=0; ${
            options.secure ? 'secure;' : ''
          } samesite=${options.sameSite};`;
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-application-name': 'pointme',
        },
      },
    }
  );
};

// Export singleton instance
export const supabase = createClient(); 