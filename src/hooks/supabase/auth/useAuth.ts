/**
 * @deprecated This hook is deprecated. Use `useAuth` from '@/lib/supabase/auth/context/AuthContext' instead.
 * This provides the same functionality with a more consistent API.
 */

import { useToast } from '@/hooks/useToast';
import { convertToAuthError } from '@/lib/error/auth-error-utils';
import { AuthService } from '@/lib/supabase/services/auth/auth.service';
import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { AuthError, AuthRole, DbProfile } from '@/types/database/auth';
import type { Session, User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Use DbProfile as the Profile type for this hook
export type Profile = DbProfile;

interface UseAuthOptions {
  redirectToLogin?: boolean;
  requireAuth?: boolean;
  redirectPath?: string;
  sessionTimeout?: number; // in milliseconds
}

interface UseAuthReturn {
  // User data
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  
  // Auth state
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: AuthRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Consolidated auth hook that combines functionality from useSupabaseAuth, useAuth, and useAuthSync
 * @deprecated Use useAuth from '@/lib/supabase/auth/context/AuthContext' instead.
 */
export function useAuth({
  redirectToLogin = false,
  requireAuth = false,
  redirectPath = '/login',
  sessionTimeout = 30 * 60 * 1000, // 30 minutes by default
}: UseAuthOptions = {}): UseAuthReturn {
  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // Fetch profile data
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const client = await supabaseClientService.getBrowserClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  // Initialize session and user
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const authService = AuthService.getInstance();
        const { data, error } = await authService.getSession();
        
        if (error) throw error;
        
        setSession(data);
        setUser(data?.user ?? null);
        setIsAuthenticated(!!data?.user);
        
        if (data?.user) {
          await fetchProfile(data.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(convertToAuthError(error));
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
      }
    };

    // Set up auth state change listener
    const setupAuthListener = async () => {
      try {
        const client = await supabaseClientService.getBrowserClient();
        const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Supabase auth event: ${event}`);
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        return () => {};
      }
    };

    // Initialize auth and set up listener
    initAuth();
    const unsubscribePromise = setupAuthListener();
    
    // Cleanup function
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, [fetchProfile]);

  // Update last activity time on user interactions
  useEffect(() => {
    const updateActivityTime = () => {
      setLastActivityTime(Date.now());
    };

    // Add event listeners for user activity
    window.addEventListener('click', updateActivityTime);
    window.addEventListener('keypress', updateActivityTime);
    window.addEventListener('scroll', updateActivityTime);
    window.addEventListener('mousemove', updateActivityTime);

    return () => {
      window.removeEventListener('click', updateActivityTime);
      window.removeEventListener('keypress', updateActivityTime);
      window.removeEventListener('scroll', updateActivityTime);
      window.removeEventListener('mousemove', updateActivityTime);
    };
  }, []);

  // Check for session expiration periodically
  useEffect(() => {
    const checkSessionExpiration = () => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivityTime;
      
      if (user && timeSinceLastActivity > sessionTimeout) {
        showToast({
          type: 'warning',
          message: 'Your session has expired due to inactivity. Please log in again.'
        });
        // Force logout
        signOut();
        router.push(`${redirectPath}?redirect=${encodeURIComponent(pathname || '')}&expired=true`);
      }
    };
    
    const interval = setInterval(checkSessionExpiration, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user, lastActivityTime, pathname, redirectPath, router, sessionTimeout, showToast]);

  // Handle authentication requirements
  useEffect(() => {
    if (!isLoading && sessionChecked) {
      if (requireAuth && !isAuthenticated && redirectToLogin) {
        showToast({
          type: 'info',
          message: 'Please log in to access this page'
        });
        router.push(`${redirectPath}?redirect=${encodeURIComponent(pathname || '')}`);
      }
    }
  }, [isLoading, sessionChecked, isAuthenticated, requireAuth, redirectToLogin, redirectPath, pathname, router, showToast]);

  // Auth methods
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authService = AuthService.getInstance();
      const result = await authService.login({ email, password });
      
      if (result.error) {
        throw result.error;
      }
      
      if (result.data) {
        setSession(result.data);
        setUser(result.data.user);
        setIsAuthenticated(true);
        
        if (result.data.user) {
          await fetchProfile(result.data.user.id);
        }
      }
      
      router.push('/dashboard');
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, role: AuthRole) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authService = AuthService.getInstance();
      const result = await authService.register({ email, password, role });
      
      if (result.error) {
        throw result.error;
      }
      
      if (result.data) {
        setSession(result.data);
        setUser(result.data.user);
        setIsAuthenticated(true);
        
        if (result.data.user) {
          await fetchProfile(result.data.user.id);
        }
      }
      
      router.push('/dashboard');
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authService = AuthService.getInstance();
      const { error } = await authService.logout();
      
      if (error) {
        throw error;
      }
      
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      router.push('/login');
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authService = AuthService.getInstance();
      const { error } = await authService.resetPassword(email);
      
      if (error) {
        throw error;
      }
      
      showToast({
        type: 'success',
        message: 'Password reset email sent. Please check your inbox.'
      });
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authService = AuthService.getInstance();
      const { error } = await authService.updatePassword(password);
      
      if (error) {
        throw error;
      }
      
      showToast({
        type: 'success',
        message: 'Password updated successfully.'
      });
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No user logged in');
      }
      
      // Create a clean authProfileUpdates object with only the properties that exist in AuthProfile
      // This avoids type compatibility issues between Profile and AuthProfile
      const authProfileUpdates: Record<string, any> = {};
      
      // Copy properties that exist in both types
      if ('id' in updates) authProfileUpdates.id = updates.id;
      if ('user_id' in updates) authProfileUpdates.user_id = updates.user_id;
      if ('full_name' in updates) authProfileUpdates.full_name = updates.full_name;
      if ('email' in updates) authProfileUpdates.email = updates.email;
      if ('role' in updates) authProfileUpdates.role = updates.role;
      if ('status' in updates) authProfileUpdates.status = updates.status;
      if ('avatar_url' in updates) authProfileUpdates.avatar_url = updates.avatar_url;
      if ('cover_image_url' in updates) authProfileUpdates.cover_image_url = updates.cover_image_url;
      
      // Handle special case for email_verified -> is_email_verified conversion
      if ('email_verified' in updates && updates.email_verified !== null) {
        authProfileUpdates.is_email_verified = Boolean(updates.email_verified);
      }
      
      const authService = AuthService.getInstance();
      const { data, error } = await authService.updateProfile(authProfileUpdates);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Convert AuthProfile back to Profile (DbProfile)
        const updatedProfile: Profile = {
          ...profile,
          ...data,
          // Ensure all required fields from Profile are present
          id: data.id,
          user_id: data.user_id,
          email: data.email,
          full_name: data.full_name || null,
          role: data.role,
          status: data.status,
          avatar_url: data.avatar_url || null,
          cover_image_url: data.cover_image_url || null,
          created_at: data.created_at || null,
          updated_at: data.updated_at || null,
          onboarding_completed: data.onboarding_completed || null,
          email_verified: data.is_email_verified || null,
        };
        
        setProfile(updatedProfile);
      }
      
      showToast({
        type: 'success',
        message: 'Profile updated successfully.'
      });
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authService = AuthService.getInstance();
      const { error } = await authService.verifyEmail(code);
      
      if (error) {
        throw error;
      }
      
      showToast({
        type: 'success',
        message: 'Email verified successfully.'
      });
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authService = AuthService.getInstance();
      const { error } = await authService.resendVerification();
      
      if (error) {
        throw error;
      }
      
      showToast({
        type: 'success',
        message: 'Verification email sent. Please check your inbox.'
      });
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authService = AuthService.getInstance();
      const { data, error } = await authService.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setSession(data);
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      const authError = convertToAuthError(error);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    user,
    profile,
    session,
    isLoading,
    isAuthenticated,
    error,
    
    // Methods
    login,
    register,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    verifyEmail,
    resendVerification,
    refreshSession,
  };
}

// For backward compatibility
export const useSupabaseAuth = useAuth;

export default useAuth;
