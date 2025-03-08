import { useToast } from '@/hooks/ui/useToast';
import { sessionManager } from '@/lib/auth/session-manager';
import { convertToAuthError } from '@/lib/error/auth-error-converter';
import { logError } from '@/lib/error/error-logger';
import { authService } from '@/lib/supabase/services/auth/auth.service';
import { AuthProfile } from '@/types/auth';
import { AuthError } from '@/types/database/auth';
import { Session, User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

/**
 * Options for the useAuth hook
 */
export interface UseAuthOptions {
  redirectTo?: string;
  onAuthStateChange?: (session: Session | null) => void;
  onError?: (error: AuthError) => void;
}

/**
 * Return type for the useAuth hook
 */
interface UseAuthReturn {
  // User state
  user: User | null;
  profile: AuthProfile | null;
  session: Session | null;
  
  // Auth state
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Utility function to safely convert profile data
const safelyConvertProfile = (profileData: any): AuthProfile | null => {
  if (!profileData) return null;
  
  try {
    // Create a compatible profile object with all required fields
    return {
      id: profileData.id || '',
      user_id: profileData.user_id || profileData.id || '',
      email: profileData.email || '',
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      role: profileData.role || 'customer',
      status: profileData.status || 'active',
      avatar_url: profileData.avatar_url || null,
      phone_number: profileData.phone || profileData.phone_number || null,
      created_at: profileData.created_at || new Date().toISOString(),
      updated_at: profileData.updated_at || new Date().toISOString(),
      
      // Auth-specific fields
      is_verified: Boolean(profileData.is_verified) || true,
      is_email_verified: Boolean(profileData.email_verified || profileData.is_email_verified) || false,
      last_login: profileData.last_login || null,
      login_count: profileData.login_count || 0,
      failed_login_attempts: profileData.failed_login_attempts || 0,
      last_failed_login: profileData.last_failed_login || null,
      password_reset_token: profileData.password_reset_token || null,
      password_reset_expires: profileData.password_reset_expires || null,
    } as AuthProfile;
  } catch (error) {
    console.error('Error converting profile:', error);
    return null;
  }
};

/**
 * Hook for authentication functionality
 * Provides user state and auth methods using the authService singleton
 * 
 * @param options Hook configuration options
 * @returns Authentication state and methods
 */
export function useAuth({
  onAuthStateChange,
  onError,
}: UseAuthOptions = {}): UseAuthReturn {
  // Local state for hook-specific loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionWarningShown, setSessionWarningShown] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Get the current session
        const { data: sessionData } = await authService.getSession();
        setSession(sessionData);
        
        if (sessionData?.user) {
          setUser(sessionData.user);
          
          // Start session monitoring if we have a session
          if (sessionData.expires_at) {
            // Convert to ISO string if it's a number (timestamp)
            const expiresAtString = typeof sessionData.expires_at === 'number' 
              ? new Date(sessionData.expires_at * 1000).toISOString() 
              : sessionData.expires_at;
            
            sessionManager.startSessionMonitoring(expiresAtString);
          }
          
          try {
            // Get the user profile
            const { data: profileData } = await authService.getProfile();
            if (profileData) {
              setProfile(safelyConvertProfile(profileData));
            }
          } catch (profileErr) {
            console.error('Error fetching profile:', profileErr);
            logError(profileErr, sessionData.user.id, { action: 'fetchProfile' });
          }
        }
      } catch (err) {
        const customError = convertToAuthError(err);
        // Use setState with a function to avoid type issues
        setError(() => customError);
        if (onError) onError(customError as any);
        logError(err, user?.id, { action: 'initAuth' });
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Set up auth state change listener
    let unsubscribe = () => {};
    
    try {
      const subscription = authService.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Start or stop session monitoring based on session state
        if (newSession?.expires_at) {
          // Convert to ISO string if it's a number (timestamp)
          const expiresAtString = typeof newSession.expires_at === 'number' 
            ? new Date(newSession.expires_at * 1000).toISOString() 
            : newSession.expires_at;
          
          sessionManager.startSessionMonitoring(expiresAtString);
        } else {
          sessionManager.stopSessionMonitoring();
        }
        
        if (newSession?.user) {
          authService.getProfile()
            .then(({ data: profileData }) => {
              if (profileData) {
                setProfile(safelyConvertProfile(profileData));
              }
            })
            .catch(err => {
              console.error('Error fetching profile:', err);
              logError(err, newSession.user.id, { action: 'fetchProfileOnAuthChange' });
            });
        } else {
          setProfile(null);
        }
        
        if (onAuthStateChange) {
          onAuthStateChange(newSession);
        }
      });
      
      // Handle different return types from onAuthStateChange
      if (subscription) {
        if (typeof subscription === 'object') {
          if ('data' in subscription && 
              subscription.data && 
              typeof subscription.data === 'object' && 
              'subscription' in subscription.data && 
              subscription.data.subscription && 
              typeof subscription.data.subscription === 'object' && 
              'unsubscribe' in subscription.data.subscription && 
              typeof subscription.data.subscription.unsubscribe === 'function') {
            unsubscribe = subscription.data.subscription.unsubscribe.bind(subscription.data.subscription);
          } else if ('subscription' in subscription && 
                    subscription.subscription && 
                    typeof subscription.subscription === 'object' && 
                    'unsubscribe' in subscription.subscription && 
                    typeof subscription.subscription.unsubscribe === 'function') {
            unsubscribe = subscription.subscription.unsubscribe.bind(subscription.subscription);
          }
        }
      }
      
      // Set up session expiration warning listener
      const removeExpirationListener = sessionManager.onSessionExpiringSoon(() => {
        if (!sessionWarningShown) {
          toast.warning("Your session will expire soon. Click here to stay logged in.", {
            action: {
              label: "Stay Logged In",
              onClick: () => refreshSession()
            },
            duration: 10000 // 10 seconds
          });
          setSessionWarningShown(true);
        }
      });
      
      // Set up session refresh listener
      const removeRefreshListener = sessionManager.onSessionRefreshed(() => {
        setSessionWarningShown(false);
      });
      
      return () => {
        unsubscribe();
        removeExpirationListener();
        removeRefreshListener();
        sessionManager.stopSessionMonitoring();
      };
    } catch (err) {
      console.error('Error setting up auth state change listener:', err);
      logError(err, user?.id, { action: 'setupAuthListener' });
      return () => {};
    }
  }, [onAuthStateChange, onError]);
  
  // Derived state
  const isAuthenticated = !!user;
  
  // Method to handle login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
      throw customError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle registration
  const register = useCallback(async (email: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register({
        email,
        password,
        role
      });
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
      throw customError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle password reset
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
      throw customError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle password update
  const updatePassword = useCallback(async (newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.updatePassword(newPassword);
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
      throw customError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle email verification
  const verifyEmail = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This method might need to be implemented in authService
      if (typeof authService.verifyEmail === 'function') {
        await authService.verifyEmail(code);
      } else {
        console.warn('verifyEmail not implemented in authService');
      }
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
      throw customError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle resending verification email
  const resendVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This method might need to be implemented in authService
      if (typeof authService.resendVerification === 'function') {
        await authService.resendVerification();
      } else {
        console.warn('resendVerification not implemented in authService');
      }
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
      throw customError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle profile update
  const updateProfile = useCallback(async (data: Partial<AuthProfile>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Convert app profile to DB profile format with proper type handling
      const dbProfileData: Record<string, any> = {
        // Only include properties that exist in the data object
        ...(data.first_name !== undefined && { first_name: data.first_name }),
        ...(data.last_name !== undefined && { last_name: data.last_name }),
        ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
        ...(data.phone_number !== undefined && { phone: data.phone_number }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.status !== undefined && { status: data.status })
      };
      
      // This method might need to be implemented in authService
      if (typeof authService.updateProfile === 'function') {
        const { data: updatedProfile } = await authService.updateProfile(dbProfileData);
        if (updatedProfile) {
          setProfile(safelyConvertProfile(updatedProfile));
        }
      } else {
        console.warn('updateProfile not implemented in authService');
      }
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
      throw customError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle session refresh
  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the session manager to refresh the session
      await sessionManager.refreshSession();
      
      // Get the updated session
      const { data: refreshedSession } = await authService.getSession();
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        
        // Reset the session warning flag
        setSessionWarningShown(false);
        
        // Get the updated profile
        const { data: profileData } = await authService.getProfile();
        if (profileData) {
          setProfile(safelyConvertProfile(profileData));
        }
      }
    } catch (err) {
      const customError = convertToAuthError(err);
      // Use setState with a function to avoid type issues
      setError(() => customError);
      if (onError) onError(customError as any);
      logError(err, user?.id, { action: 'refreshSession' });
    } finally {
      setIsLoading(false);
    }
  }, [onError, user?.id]);
  
  return {
    // User state
    user,
    profile,
    session,
    
    // Auth state
    isLoading,
    isAuthenticated,
    error,
    
    // Auth methods
    login,
    register,
    signOut,
    resetPassword,
    updatePassword,
    verifyEmail,
    resendVerification,
    updateProfile,
    refreshSession,
  };
} 