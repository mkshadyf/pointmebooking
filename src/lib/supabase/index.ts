import { createBrowserClient } from '@supabase/ssr';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

// Export singleton instance for browser
export const supabase = createBrowserSupabaseClient();

// Re-export common types and interfaces
export * from './config';

// Auth exports
export { AuthContext, AuthProvider, useAuth } from './auth/context/AuthContext';
export type { AuthContextType } from './auth/context/AuthContext';
export { withAuth } from './auth/guards/withAuth';

// Service exports
export {
  AuthService,
  BookingService,
  CategoryService,
  EmailService,
  ProfileService,
  SearchService,
  ServiceService
} from './services';

// Hook exports
export {
  useSupabaseRealtime,
  useSupabaseStorage
} from './hooks';

// Type exports
export type {
  ApiResponse, AuthProfile,
  AuthRole, BookingInsert, BookingUpdate, CategoryInsert, CategoryUpdate, DbBooking,
  DbCategory, DbProfile,
  DbService, PaginatedResponse, ProfileInsert, ProfileUpdate, ServiceInsert, ServiceUpdate, ServiceWithRelations, SupabaseAuthError
} from './types';

// Store exports
export { useStore } from './store';
export type { StoreState } from './store';

// Utility exports
export {
  handleApiError, handleAuthError, handleClientError,
  type AppError
} from './utils/errors';

export {
  validateEmail,
  validatePassword,
  validateUrl
} from './utils/validators';

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