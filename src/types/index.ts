import { Provider } from "@supabase/supabase-js";

// Base types
export * from './api';
// The types in ./auth are already exported via the database types.
// Remove this line.
export * from './booking';
 
// Constants
export const USER_ROLES = ['customer', 'business', 'admin'] as const;
export const USER_STATUSES = ['active', 'inactive', 'suspended'] as const;
export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
export const SERVICE_STATUSES = ['active', 'inactive', 'deleted'] as const;

// Derived types
export type UserRole = typeof USER_ROLES[number];
export type UserStatus = typeof USER_STATUSES[number];
export type BookingStatus = typeof BOOKING_STATUSES[number];
export type ServiceStatus = typeof SERVICE_STATUSES[number];

// Base interfaces
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  email_verified: boolean;
  verification_code?: string;
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

export interface DayHours {
  start: string;
  end: string;
  is_closed?: boolean;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface BusinessProfile extends UserProfile {
  business_name: string;
  business_category: string;
  business_type: string;
  description: string;
  location: string;
  contact_number: string;
  working_hours: WorkingHours;
  services: Service[];
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  status: ServiceStatus;
  category_id: string;
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
    name: string;
    icon?: string;
  };
}

export interface Booking {
  id: string;
  service_id: string;
  customer_id: string;
  business_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  businesses?: BusinessProfile[];
  services?: Service[];
  service_count?: number;
}

export interface AuthContextType {
  user: UserProfile | null;
  profile: BusinessProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithProvider: (provider: Provider) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  verificationAttempts: number;
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
  services: Service[];
}

