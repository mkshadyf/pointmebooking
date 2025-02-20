import { AuthService } from '@/lib/supabase/services/auth.service';
import { AuthProfile, AuthRole } from '@/types/database/auth';
import { User } from '@supabase/supabase-js';
import { StateCreator } from 'zustand';
import { DbProfile } from '../../types';
import { RootState } from '../store';
import { SupabaseStore } from '../store.types';

async function handleAuthAction<T = void>(
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  action: () => Promise<T>,
  onSuccess?: (result: T) => Promise<void>
): Promise<void> {
  set({ isLoading: true, error: null });
  try {
    const result = await action();
    if (onSuccess) await onSuccess(result);
  } catch (error) {
    set({ error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  } finally {
    set({ isLoading: false });
  }
}

export interface AuthState {
  user: User | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: AuthRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setProfile: (profile: AuthProfile | null) => void;
}

export interface AuthSlice extends AuthState, AuthActions {}

const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const createAuthProfile = (profile: DbProfile): AuthProfile => ({
  ...profile,
  verification_attempts: profile.verification_attempts || 0,
  role: profile.role as AuthRole,
  is_verified: profile.email_verified ?? false,
  is_email_verified: profile.email_verified ?? false,
  email: profile.email || '',
  onboarding_completed: profile.onboarding_completed ?? false,
  working_hours: profile.working_hours || {},
  preferences: profile.preferences || {},
  social_media: profile.social_media || {},
  created_at: profile.created_at || new Date().toISOString(),
  updated_at: profile.updated_at || new Date().toISOString()
});

export const authSlice: StateCreator<SupabaseStore, [], [], AuthSlice> = (set) => ({
  ...initialState,

  login: async (email: string, password: string) => {
    await handleAuthAction(
      set,
      () => AuthService.login({ email, password, role: 'customer' as AuthRole }),
      async (session) => {
        if (session.user) {
          set({ user: session.user, isAuthenticated: true });
          const profile = await AuthService.getProfile();
          if (profile) {
            set({ profile: createAuthProfile(profile) });
          }
        }
      }
    );
  },

  register: async (email: string, password: string, role: AuthRole) => {
    await handleAuthAction(
      set,
      () => AuthService.register({ email, password, role }),
      async (session) => {
        if (session.user) {
          set({ user: session.user, isAuthenticated: true });
          const profile = await AuthService.getProfile();
          if (profile) {
            set({ profile: createAuthProfile(profile) });
          }
        }
      }
    );
  },

  logout: async () => {
    await handleAuthAction(
      set,
      () => AuthService.logout(),
      async () => {
        set({ user: null, profile: null, isAuthenticated: false });
      }
    );
  },

  updateProfile: async (data: Partial<AuthProfile>) => {
    await handleAuthAction(
      set,
      () => AuthService.updateProfile(data),
      async (updatedProfile) => {
        if (updatedProfile) {
          set((state) => ({
            profile: state.profile ? createAuthProfile({ ...state.profile, ...updatedProfile }) : null
          }));
        }
      }
    );
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setIsAuthenticated: (isAuthenticated) => {
    set({ isAuthenticated });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  setProfile: (profile: AuthProfile | null) => {
    set({ profile });
  },
});

// Selectors
export const selectUser = (state: RootState) => state.user;
export const selectIsAuthenticated = (state: RootState) => state.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.isLoading;

// Store hook
export const useAuthStore = (selector: (state: AuthState) => any) => {
  return selector;
}; 