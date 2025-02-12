import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Browser client
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Server client
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(options: any) {
          cookieStore.delete(options);
        },
      },
    }
  );
};

// User related functions
export async function getUser() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: { user }, error } = await (await supabase).auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getUserProfile() {
  const user = await getUser();
  if (!user) return null;

  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await (await supabase)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await (await supabase)
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// React hook for browser client
export function useSupabase() {
  return createBrowserSupabaseClient();
}

// Configuration
export * from './config';

// Client exports
export {
    createClient,
    createServerSupabaseClient, supabase, type SupabaseClient
} from './client';

// Auth exports
export {
    AuthProvider,
    useAuth,
    withAuth
} from './auth';

// Hook exports
export {
    useSupabaseAuth,
    useSupabaseRealtime,
    useSupabaseStorage,
    type UseSupabaseRealtimeOptions,
    type UseSupabaseStorageOptions,
    type UseSupabaseStorageReturn
} from './hooks';

// Service exports
export {
    BookingService,
    CategoryService,
    ProfileService,
    ServiceService
} from './services';

// Type exports
export * from './types';

// Constants
export const SUPABASE_CONFIG = {
  STORAGE_BUCKETS: {
    PUBLIC: 'public',
    AVATARS: 'avatars',
    LOGOS: 'logos',
    SERVICES: 'services',
  },
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  REALTIME_CHANNELS: {
    BOOKINGS: 'bookings',
    SERVICES: 'services',
    PROFILES: 'profiles',
  },
} as const; 