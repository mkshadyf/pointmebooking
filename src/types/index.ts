import { Provider } from "@supabase/supabase-js";

// Auth Constants
export const USER_ROLES = ['customer', 'business', 'admin'] as const;
export const USER_STATUSES = ['active', 'inactive', 'suspended'] as const;
export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
export const SERVICE_STATUSES = ['active', 'inactive', 'deleted'] as const;

// Auth Types
export type UserRole = typeof USER_ROLES[number];
export type UserStatus = typeof USER_STATUSES[number];
export type BookingStatus = typeof BOOKING_STATUSES[number];
export type ServiceStatus = typeof SERVICE_STATUSES[number];

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
  start?: string; // Legacy support
  end?: string;   // Legacy support
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
  description: string;
  price: number;
  duration: number;
  category_id: string;
  image_url?: string;
  status: 'active' | 'inactive' | 'deleted';
  is_available: boolean;
  created_at: string;
  updated_at: string;
  business?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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

export interface Business {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  operating_hours?: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: 'customer' | 'business' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
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

export type { Database } from './database.types';
