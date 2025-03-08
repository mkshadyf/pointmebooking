import {
    APPROVAL_STATUSES,
    BOOKING_STATUSES,
    SERVICE_STATUSES,
    USER_ROLES,
    USER_STATUSES
} from '@/constants/entities';
import { Json } from './database/generated.types';

// Import entity types
import type {
    ApprovalStatus,
    BookingStatus,
    ServiceStatus,
    UserRole,
    UserStatus
} from '@/constants/entities';

// Re-export entity constants
export {
    APPROVAL_STATUSES,
    BOOKING_STATUSES,
    SERVICE_STATUSES,
    USER_ROLES,
    USER_STATUSES
};

// Re-export entity types
    export type {
        ApprovalStatus, BookingStatus,
        ServiceStatus, UserRole,
        UserStatus
    };

// Import from auth types
    import { AUTH_CONSTANTS } from './auth';
export { AUTH_CONSTANTS };

// Import types from auth module
    import type {
        AuthContextType,
        AuthError,
        AuthProfile,
        AuthResponse,
        AuthResult,
        DbProfile,
        LoginCredentials
    } from './auth';

// Re-export auth types
export type {
    AuthContextType,
    AuthError,
    AuthProfile,
    AuthResponse,
    AuthResult,
    DbProfile,
    LoginCredentials
};

// Import database types
    import type {
        Database,
        Tables
    } from './database/generated.types';

// Re-export database types
export type {
    Database,
    Tables
};

// Import booking types
    import type {
        Booking,
        BookingFilters,
        BookingStats,
        PopularService
    } from './booking';

// Re-export booking types 
export type {
    Booking,
    BookingFilters,
    BookingStats,
    PopularService
};

// Export types
    export type {
        BookingFilters as BookingFiltersType,
        BookingStats as BookingStatsType, Booking as BookingType, PopularService as PopularServiceType
    } from './booking';

// Standard type exports
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

// Generic response type for API endpoints
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

// Common status type
export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

// Date format types
export type DateString = string; // ISO format YYYY-MM-DD
export type DateTimeString = string; // ISO format YYYY-MM-DDTHH:mm:ss.sssZ

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search query type
export interface SearchQuery {
  query?: string; 
  filters?: Record<string, any>;
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string[]>;
}

// User and Profile interfaces
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  first_name?: string | null | undefined;
  last_name?: string | null | undefined;
  email: string;
  role: UserRole;
  email_verified: boolean;
  verification_code?: string;
  preferences?: Json | null;
  working_hours?: WorkingHours | null;
  social_media?: Json | null;
  verification_attempts?: number | null;
  business_name?: string;
  business_type?: string;
  business_category?: string;
  description?: string;
  location?: string;
  contact_number?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  contact_email?: string;
  website?: string;
  avatar_url?: string;
  logo_url?: string;
  cover_image_url?: string;
  status: UserStatus;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Business and Service interfaces
export interface DayHours {
  start: string;
  end: string;
  is_closed?: boolean;
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    is_closed?: boolean;
  } | undefined;
}

export interface BusinessProfile extends UserProfile {
  business_name: string;
  business_category: string;
  business_type: string;
  description: string;
  location: string;
  contact_number: string;
  working_hours: WorkingHours;
  services: UIService[];
}

// Service interface for UI components
export interface UIService {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  image_url: string | null;
  is_available: boolean | null;
  created_at: string;
  updated_at: string;
  status: ServiceStatus;
  category_id: string | null;
  max_capacity: number | null;
  location: string | null;
  created_by_id: string | null;
  approved_by_id: string | null;
  approved_at: string | null;
  featured: boolean;
  featured_order: number | null;
  approval_status: ApprovalStatus;
  admin_notes: string | null;
  business?: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
}

// Category interfaces
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string | null;
  updated_at?: string | null;
  businesses?: BusinessProfile[];
  services?: UIService[];
  service_count?: number;
}

export interface BusinessCategory {
  id: string;
  name: string;
  businesses: BusinessProfile[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: UIService[];
}

// Business interface
export interface Business {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

