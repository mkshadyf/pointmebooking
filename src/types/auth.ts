import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  role: 'business' | 'customer' | 'admin';
  onboarding_completed: boolean;
  business_name?: string;
  business_description?: string;
  business_address?: string;
  business_city?: string;
  business_state?: string;
  business_zip?: string;
  business_country?: string;
  business_phone?: string;
  business_email?: string;
  business_website?: string;
  business_logo?: string;
  business_banner?: string;
  verification_attempts: number;
  email_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
}

export type AuthAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };
