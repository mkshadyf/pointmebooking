import { ErrorHandler } from '@/lib/error-handling';
import { AuthService } from '@/lib/supabase/services/auth.service';
import { AuthError, AuthProfile, AuthResponse, AuthRole, DbProfile } from '@/types/database/auth';
import { User } from '@supabase/supabase-js';
import { StateCreator } from 'zustand';
import { RootState } from '../store';
import { SupabaseStore } from '../store.types';

// Helper function to create an AuthProfile from a DbProfile
const createAuthProfile = (profile: DbProfile): AuthProfile => ({
  ...profile,
  // Additional auth-specific fields
  is_verified: profile.email_verified ?? false,
  is_email_verified: profile.email_verified ?? false,
  last_login: null,
  login_count: 0,
  failed_login_attempts: 0,
  last_failed_login: null,
  password_reset_token: null,
  password_reset_expires: null
});

// Helper function to handle auth actions with consistent error handling
async function handleAuthAction<T = void>(
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  authServiceMethod: () => Promise<AuthResponse<T>>,
  onSuccess?: (result: T) => Promise<void>,
  context?: string
): Promise<void> {
  set({ isLoading: true, error: null });
  try {
    const result = await authServiceMethod();
    if (result.error) {
      throw result.error;
    }
    if (result.data && onSuccess) {
      await onSuccess(result.data);
    }
  } catch (error) {
    const appError = ErrorHandler.convertToAppError(error, context);
    set({ error: appError as AuthError });
    throw appError;
  } finally {
    set({ isLoading: false });
  }
}

// Auth slice interface
export interface AuthSlice {
  user: User | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  initialized: boolean;
  
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (email: string, password: string, role: AuthRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
  
  clearError: () => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setProfile: (profile: AuthProfile | null) => void;
  setError: (error: AuthError | null) => void;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  initialized: boolean;
}

// Initial auth state
const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialized: false
};

// Auth slice implementation
export const authSlice: StateCreator<SupabaseStore, [], [], AuthSlice> = (set) => ({
  ...initialState,

  login: async (credentials) => {
    await handleAuthAction(
      set,
      () => AuthService.login(credentials),
      async (data) => {
        if (data?.supabaseUser) {
          set({ user: data.supabaseUser, isAuthenticated: true });
          const profileResult = await AuthService.getProfile();
          if (profileResult.data) {
            set({ profile: createAuthProfile(profileResult.data) });
          }
        }
      },
      'auth.login'
    );
  },

  register: async (email, password, role) => {
    await handleAuthAction(
      set,
      () => AuthService.register(email, password, role),
      async (data) => {
        if (data.supabaseUser) {
          set({ user: data.supabaseUser, isAuthenticated: true });
          const profileResult = await AuthService.getProfile();
          if (profileResult.data) {
            set({ profile: createAuthProfile(profileResult.data) });
          }
        }
      },
      'auth.register'
    );
  },

  logout: async () => {
    await handleAuthAction(
      set,
      () => AuthService.logout(),
      async () => {
        set({ user: null, profile: null, isAuthenticated: false });
      },
      'auth.logout'
    );
  },

  updateProfile: async (data) => {
    await handleAuthAction(
      set,
      () => AuthService.updateProfile(data),
      async (updatedProfile) => {
        if (updatedProfile) {
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...updatedProfile } : null
          }));
        }
      },
      'auth.updateProfile'
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

  setError: (error: AuthError | null) => {
    set({ error });
  }
});

// Selectors
export const selectUser = (state: RootState) => state.user;
export const selectIsAuthenticated = (state: RootState) => state.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.isLoading;

// Store hook
export const useAuthStore = (selector: (state: AuthState) => unknown) => {
  return selector;
}; 