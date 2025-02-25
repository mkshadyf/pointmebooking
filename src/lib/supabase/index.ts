import { Database } from '@generated.types';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Re-export types and interfaces
// Use the centralized types!
export type { AuthProfile, Booking, BusinessCategory, ServiceCategory } from '@/lib/supabase/types';
export { AuthContext, AuthProvider, useAuth } from './auth/context/AuthContext';

// Re-export services
export { AuthService } from './services/auth.service';
export { BookingService } from './services/booking.service';
export { ProfileService } from './services/profile.service';
export { ServiceService } from './services/service.service';

// Re-export common types and interfaces
export * from './config';

// Auth exports
export { withAuth } from './auth/guards/withAuth';

// Service exports
export { EmailService, SearchService } from './services';

// Hook exports
export {
    useSupabaseRealtime,
    useSupabaseStorage
} from './hooks';

// Type exports
export type {
    ApiResponse,
    BookingInsert,
    BookingUpdate,
    BusinessCategoryInsert,
    BusinessCategoryUpdate,
    DbBooking,
    DbBusinessCategory,
    DbProfile,
    DbService,
    PaginatedResponse,
    ProfileInsert,
    ProfileUpdate,
    ServiceInsert,
    ServiceUpdate,
    ServiceWithRelations,
    SupabaseAuthError
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