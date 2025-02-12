export const SUPABASE_CONFIG = {
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

// Environment variables
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Constants
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second 