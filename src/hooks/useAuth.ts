import AuthService from '@/lib/auth/auth-service';
import { ToastService } from '@/lib/core/toast';
import { handleAuthError } from '@/lib/error/auth-error-handler';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type User = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  aud?: string;
} | null;

export function useAuth() {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Load user on initial render
  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.warn('[useAuth] Error loading user, treating as logged out', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    }
    
    loadUser();
  }, []);

  // Login function
  async function login(email: string, password: string) {
    try {
      setIsLoading(true);
      const data = await AuthService.signInWithEmail(email, password);
      setUser(data.user);
      ToastService.success('Successfully logged in!');
      return { success: true, data };
    } catch (error) {
      // Handle auth errors with our centralized handler
      handleAuthError(error, {
        context: 'login',
        action: 'signIn'
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }

  // Signup function
  async function signup(email: string, password: string) {
    try {
      setIsLoading(true);
      const data = await AuthService.signUp(email, password);
      
      // If email confirmation is required, the user might be null
      setUser(data.user);
      
      if (!data.user) {
        ToastService.info('Please check your email to confirm your account');
      } else {
        ToastService.success('Successfully signed up!');
      }
      
      return { success: true, data };
    } catch (error) {
      // Handle auth errors with our centralized handler
      handleAuthError(error, {
        context: 'signup',
        action: 'signUp'
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }

  // Logout function
  async function logout() {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      setUser(null);
      ToastService.success('Successfully logged out');
      router.push('/login');
      return { success: true };
    } catch (error) {
      // Handle auth errors with our centralized handler
      handleAuthError(error, {
        context: 'logout',
        action: 'signOut'
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }

  // Reset password function
  async function resetPassword(email: string) {
    try {
      setIsLoading(true);
      await AuthService.resetPassword(email);
      ToastService.success('Password reset email sent. Please check your inbox.');
      return { success: true };
    } catch (error) {
      // Handle auth errors with our centralized handler
      handleAuthError(error, {
        context: 'resetPassword',
        action: 'resetPassword'
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword
  };
} 