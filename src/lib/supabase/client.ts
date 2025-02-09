import { createBrowserClient, createServerClient } from '@supabase/ssr';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return '';
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return match ? decodeURIComponent(match[3]) : '';
      },
      set(name: string, value: string, options: any = {}) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=${encodeURIComponent(value)}; path=${options.path || '/'};${
          options.expires ? ` expires=${options.expires};` : ''
        }${options.secure ? ' secure;' : ''}${options.sameSite ? ` samesite=${options.sameSite};` : ''}`;
      },
      remove(name: string, options: any = {}) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=; path=${options.path || '/'};${
          options.secure ? ' secure;' : ''
        } expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      },
    },
  }
);

export function getBrowserSupabaseClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return '';
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return match ? decodeURIComponent(match[3]) : '';
      },
      set(name: string, value: string, options: any = {}) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=${encodeURIComponent(value)}; path=${options.path || '/'};${
          options.expires ? ` expires=${options.expires};` : ''
        }${options.secure ? ' secure;' : ''}${options.sameSite ? ` samesite=${options.sameSite};` : ''}`;
      },
      remove(name: string, options: any = {}) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=; path=${options.path || '/'};${
          options.secure ? ' secure;' : ''
        } expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      },
    },
  });
}

export async function getServerSupabaseClient(cookies: any) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookies.delete({ name, ...options });
      },
    },
  });
} 