export const SUPABASE_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  STORAGE: {
    BUCKETS: {
      PUBLIC: 'public',
      AVATARS: 'avatars',
      LOGOS: 'logos',
      SERVICES: 'services',
    },
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
  CACHE: {
    DURATION: 5 * 60 * 1000, // 5 minutes
  },
  REALTIME: {
    CHANNELS: {
      BOOKINGS: 'bookings',
      SERVICES: 'services',
      PROFILES: 'profiles',
    },
  },
  AUTH: {
    COOKIE_OPTIONS: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  },
} as const;

// Validation
if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Constants
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

// Types
export type SupabaseConfig = typeof SUPABASE_CONFIG;
export type StorageBucket = keyof typeof SUPABASE_CONFIG.STORAGE.BUCKETS;
export type RealtimeChannel = keyof typeof SUPABASE_CONFIG.REALTIME.CHANNELS; 