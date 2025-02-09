import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  role: 'business' | 'customer' | 'admin';
  onboarding_completed: boolean;
  business_name?: string;
  // Add additional fields as required by your application.
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
