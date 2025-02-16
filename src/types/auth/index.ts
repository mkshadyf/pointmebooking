import type { User } from '@supabase/supabase-js';
import type { Database } from '../database.types';

// Base profile type from database
export type DbProfile = Database['public']['Tables']['profiles']['Row'];

// Unified auth role type
export type AuthRole = 'customer' | 'business' | 'admin';

// Core profile interface
export type Profile = DbProfile & {
  email: string;
  role: AuthRole;
  onboarding_completed: boolean;
  email_verified: boolean;
  verification_code: string | null;
  verification_attempts: number;
  last_verification_attempt: string | null;
  business_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

// Auth context interface
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

// Auth state interface
export interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

// Auth actions interface
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: AuthRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  clearError: () => void;
}

export interface AuthSlice extends AuthState, AuthActions {}

// Auth form types
export type AuthFormField = {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};

export type AuthFormData = {
  email: string;
  password: string;
  [key: string]: string;
};

// Auth credentials type
export interface AuthCredentials {
  email: string;
  password: string;
  role?: AuthRole;
} 