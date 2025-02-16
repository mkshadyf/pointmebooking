import { AuthService } from '@/lib/supabase/services/auth.service';
import type { AuthProfile, AuthRole } from '@/lib/supabase/types/auth.types';
import { StateCreator } from 'zustand';
import { RootState } from '../store';

// Helper function for handling async auth actions
const handleAuthAction = async <T>(
  set: (state: Partial<AuthState>) => void,
  action: () => Promise<T>,
  onSuccess?: (result: T) => Promise<void>
) => {
  set({ isLoading: true, error: null });
  try {
    const result = await action();
    if (onSuccess && result !== undefined && result !== null) {
      await onSuccess(result);
    }
    return result;
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Failed to perform action',
    });
    throw error;
  } finally {
    set({ isLoading: false });
  }
};

export interface AuthState {
  user: AuthProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  setUser: (user: AuthProfile | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'customer' | 'business') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
  clearError: () => void;
}

export interface AuthSlice extends AuthState, AuthActions {}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  initialized: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  setIsLoading: () => {},
};

export const authSlice: StateCreator<RootState, [], [], AuthSlice> = (set) => ({
  ...initialState,

  login: async (email: string, password: string) => {
    await handleAuthAction(
      set,
      () => AuthService.login({ email, password }),
      async () => {
        const profile = await AuthService.getProfile();
        if (profile) {
          set({ user: profile as AuthProfile, isAuthenticated: true });
        }
      }
    );
  },

  register: async (email: string, password: string, role: 'customer' | 'business') => {
    await handleAuthAction(
      set,
      () => AuthService.register({ email, password, role }),
      async () => {
        const profile = await AuthService.getProfile();
        if (profile) {
          set({ user: profile as AuthProfile, isAuthenticated: true });
        }
      }
    );
  },

  logout: async () => {
    await handleAuthAction<void>(
      set,
      async () => {
        await AuthService.logout();
      },
      async () => {
        set({ user: null, isAuthenticated: false });
      }
    );
  },

  updateProfile: async (data: Partial<AuthProfile>) => {
    await handleAuthAction<AuthProfile>(
      set,
      async () => {
        const updatedProfile = await AuthService.updateProfile(data);
        return {
          ...updatedProfile,
          verification_attempts: 0,
          email_verified: false,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: updatedProfile.role as AuthRole // Cast role to AuthRole type
        };
      },
      async (profile) => {
        set({ user: profile as AuthProfile });
      }
    );
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: AuthProfile | null) => {
    set({ user, initialized: true });
  },

  setIsAuthenticated: (isAuthenticated) => {
    set({ isAuthenticated });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
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