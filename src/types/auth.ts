import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database.types';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
}

export interface AuthAction {
  type: 'SET_USER' | 'SET_PROFILE' | 'SET_LOADING' | 'SET_ERROR' | 'SET_EMAIL_VERIFIED';
  payload?: any;
}
