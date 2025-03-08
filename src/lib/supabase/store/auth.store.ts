/**
 * Authentication Store
 * 
 * This module provides a Zustand store for managing authentication state.
 * It handles user login, registration, profile management, and session control.
 */

import { logError } from '@/lib/error/error-logger';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services';

// Define a simple DbProfile type locally to avoid import issues
interface DbProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'business' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string | null;
  cover_image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  email_verified: boolean | null;
  onboarding_completed: boolean | null;
}

// Define the auth state
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  requires2FA: boolean;
  isAuthenticated: boolean;
  sessionChecked: boolean;
  profile?: DbProfile | null;
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setRequires2FA: (requires2FA: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setSessionChecked: (checked: boolean) => void;
  reset: () => void;
  
  // Add missing methods
  login: (credentials: { email: string; password: string }) => Promise<any>;
  verify2FA: (code: string, token?: string) => Promise<any>;
  logout: () => Promise<any>;
  register: (email: string, password: string, role: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  updateProfile: (data: Partial<DbProfile>) => Promise<any>;
  verifyEmail: (code: string) => Promise<any>;
  resendVerification: () => Promise<any>;
  refreshSession: () => Promise<any>;
  fetchProfile: () => Promise<any>;
  
  // Add the session integrity check method
  checkSessionIntegrity: () => Promise<boolean>;
}

// Helper function to safely convert profile data
const safeProfile = (profile: any): DbProfile | null => {
  if (!profile) return null;
  return profile as DbProfile;
};

// Helper function to handle errors during auth actions
const handleAuthError = (error: any): null => {
  console.error('Authentication error:', error);
  return null;
};

// Helper function to handle session changes
const handleSessionChange = (
  set: (state: Partial<AuthState>) => void, 
  sessionData: any
) => {
  if (sessionData) {
    // Check if it's a full Session object or just contains user data
    const isFullSession = sessionData && 
      'access_token' in sessionData && 
      'refresh_token' in sessionData;
    
    set({
      session: isFullSession ? sessionData : null,
      user: sessionData.user || null,
      isAuthenticated: true,
      isLoading: false
    });
  } else {
    set({
      session: null,
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }
};

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: false,
      error: null,
      requires2FA: false,
      isAuthenticated: false,
      sessionChecked: false,

      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setRequires2FA: (requires2FA) => set({ requires2FA }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setSessionChecked: (sessionChecked) => set({ sessionChecked }),
      reset: () => set({ 
        user: null, 
        session: null, 
        error: null, 
        requires2FA: false, 
        isAuthenticated: false,
        sessionChecked: false
      }),

      login: async (credentials: { email: string; password: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({
            email: credentials.email,
            password: credentials.password,
          });
          
          if (response.error) {
            set({ 
              error: response.error.message || 'Authentication failed',
              isLoading: false
            });
            return null;
          }

          // Use the helper function to handle session changes
          const sessionData = response.data;
          if (sessionData && 'user' in sessionData) {
            handleSessionChange(set, sessionData);
            
            // Fetch profile after successful login
            get().fetchProfile();
          } else {
            set({ 
              error: 'Invalid session data received',
              isLoading: false
            });
          }
          
          return response.data;
        } catch (error) {
          set({ 
            error: 'An unexpected error occurred during login',
            isLoading: false
          });
          return null;
        }
      },

      verify2FA: async (_code, _token) => {
        set({ isLoading: true, error: null });
        try {
          // Implement 2FA verification logic here using the authService
          // This is a placeholder for the actual implementation
          set({ isLoading: false });
          return null;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.logout();
          
          // Use the helper function to handle session changes
          handleSessionChange(set, null);
          
          // Clear any error that might have occurred
          if (response.error) {
            console.error('Logout error:', response.error);
          }
        } catch (error) {
          console.error('Unexpected logout error:', error);
          set({ 
            error: 'An unexpected error occurred during logout',
            isLoading: false
          });
        }
      },
      
      register: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ email, password, role });
          if (response.error) {
            set({ error: response.error.message || 'Registration failed', isLoading: false });
            return null;
          }
          
          // Handle the session if it exists
          const sessionData = response.data;
          if (sessionData) {
            set({
              session: sessionData,
              user: sessionData.user,
              isAuthenticated: true,
              isLoading: false
            });
            return response.data;
          }
          
          set({ isLoading: false });
          return null;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },
      
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.resetPassword(email);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },
      
      updatePassword: async (password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updatePassword(password);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },
      
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          // Convert DbProfile to AuthProfile compatible object
          const profileData: Record<string, any> = {};
          
          // Only copy properties that exist in data
          if (data.full_name !== undefined) profileData.full_name = data.full_name || '';
          if (data.email !== undefined) profileData.email = data.email;
          if (data.avatar_url !== undefined) profileData.avatar_url = data.avatar_url;
          if (data.cover_image_url !== undefined) profileData.cover_image_url = data.cover_image_url;
          if (data.role !== undefined) profileData.role = data.role;
          if (data.status !== undefined) profileData.status = data.status;
          if (data.email_verified !== undefined) profileData.email_verified = data.email_verified;
          if (data.onboarding_completed !== undefined) profileData.onboarding_completed = data.onboarding_completed;
          
          const response = await authService.updateProfile(profileData);
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            return null;
          }
          
          if (response.data) {
              set({
              profile: safeProfile(response.data),
              isLoading: false
            });
            return response.data;
          }
          
          set({ isLoading: false });
          return null;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },
      
      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyEmail(code);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },

      resendVerification: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.resendVerification();
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },
      
      refreshSession: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.refreshSession();
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            return null;
          }
          
          // Check if response.data is a Session object by checking for user property
          if (response.data && 'user' in response.data) {
            set({ 
              session: response.data,
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false
            });
            
            // Fetch profile after session refresh
            get().fetchProfile();
            return response.data;
          }
          
          set({ isLoading: false });
          return null;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.getProfile();
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
          return null;
          }
          
          if (response.data) {
            set({ 
              profile: safeProfile(response.data),
              isLoading: false
            });
            return response.data;
          }
          
          set({ isLoading: false });
          return null;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          return handleAuthError(error);
        }
      },

      /**
       * Check session integrity to prevent mismatches between stored and actual session
       * @returns True if session is valid, false otherwise
       */
      checkSessionIntegrity: async () => {
        try {
          const state = get();
          
          // Skip if already checked and recently authenticated
          if (state.sessionChecked && state.session) {
            // Check if session is still valid based on expiry
            const expiresAt = state.session.expires_at;
            if (expiresAt) {
              const expiryTime = new Date(expiresAt * 1000);
              const now = new Date();
              
              // If session is not expired, no need to check again
              if (expiryTime > now) {
                return true;
              }
            }
          }
          
          set({ isLoading: true });
          
          // Use the auth service to verify session integrity
          const { data, error } = await authService.verifySessionIntegrity(
            get().user, 
            get().session
          );
          
          if (error) {
            console.error('Session integrity check failed:', error);
            logError(error, get().user?.id, { 
              action: 'checkSessionIntegrity', 
              context: 'authStore' 
            });
            
            // Reset auth state on error
            set({ 
              error: error.message || 'Session check failed',
              isLoading: false,
              sessionChecked: true, // Mark as checked even though it failed
              isAuthenticated: false
            });
            return false;
          }
          
          if (!data || !data.sessionValid) {
            // Session is not valid, update state
            set({ 
              user: data?.user || null,
              session: data?.session || null,
              isAuthenticated: !!data?.user,
              isLoading: false,
              sessionChecked: true
            });
            return false;
          }
          
          // Session is valid, update state with correct user/session
          set({ 
            user: data.user,
            session: data.session,
            isAuthenticated: !!data.user,
            isLoading: false,
            sessionChecked: true
          });
          
          // Fetch profile after session check if authenticated
          if (data.user) {
            get().fetchProfile();
          }
          
          return true;
        } catch (err) {
          console.error('Error during session integrity check:', err);
          logError(err, get().user?.id, { 
            action: 'checkSessionIntegrity', 
            context: 'authStore' 
          });
          
          set({ isLoading: false, sessionChecked: true });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
);

// Export actions for easier access
export const authActions = {
  login: async (credentials: { email: string; password: string }) => {
    return useAuthStore.getState().login(credentials);
  },
  verify2FA: async (code: string, token?: string) => {
    return useAuthStore.getState().verify2FA(code, token);
  },
  logout: async () => {
    return useAuthStore.getState().logout();
  },
  register: async (email: string, password: string, role: string) => {
    return useAuthStore.getState().register(email, password, role);
  },
  resetPassword: async (email: string) => {
    return useAuthStore.getState().resetPassword(email);
  },
  updatePassword: async (password: string) => {
    return useAuthStore.getState().updatePassword(password);
  },
  updateProfile: async (data: Partial<DbProfile>) => {
    return useAuthStore.getState().updateProfile(data);
  },
  verifyEmail: async (code: string) => {
    return useAuthStore.getState().verifyEmail(code);
  },
  resendVerification: async () => {
    return useAuthStore.getState().resendVerification();
  },
  refreshSession: async () => {
    return useAuthStore.getState().refreshSession();
  },
  fetchProfile: async () => {
    return useAuthStore.getState().fetchProfile();
  },
};

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectSession = (state: AuthState) => state.session;
export const selectSessionId = (state: AuthState) => state.session?.access_token;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectRequires2FA = (state: AuthState) => state.requires2FA;
export const selectIsAuthenticated = (state: AuthState) => !!state.session;
export const selectIsAdmin = (state: AuthState) => state.user?.app_metadata?.role === 'admin';
export const selectIsBusiness = (state: AuthState) => state.user?.app_metadata?.role === 'business';
export const selectIsCustomer = (state: AuthState) => state.user?.app_metadata?.role === 'customer';

// Export the auth slice
export const authSlice = useAuthStore; 