import { AuthService } from '@/lib/api/services/auth.service';
import { UserProfile } from '@/types';
import { StateCreator } from 'zustand';

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  setUser: (user: UserProfile | null) => void;
}

export interface AuthSlice extends AuthState, AuthActions {}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  ...initialState,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await AuthService.login({ email, password });
      if (error) throw error;
      if (data) {
        set({ user: data, loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  register: async (email: string, password: string, role: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await AuthService.register({ email, password, role });
      if (error) throw error;
      if (data) {
        set({ user: data, loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await AuthService.logout();
      if (error) throw error;
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    try {
      const { data: updatedProfile, error } = await AuthService.updateProfile(data);
      if (error) throw error;
      if (updatedProfile) {
        set({ user: updatedProfile, loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: UserProfile | null) => {
    set({ user, initialized: true });
  },
}); 