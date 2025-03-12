/**
 * Authentication hooks for handling user authentication and authorization
 * 
 * This module exports the canonical authentication hooks that should be used
 * throughout the application.
 */

// Export the main hooks
export { useAuth } from './useAuth';
export type { UseAuthOptions, UseAuthReturn } from './useAuth';

// Export the hook as default export for convenience
export { useAuth as default } from './useAuth';

// Re-export the AuthProfile type from types for convenience
export type { AuthProfile } from '@/types/auth';

/**
 * @deprecated This is a compatibility layer for the deprecated useAuthService hook.
 * Use useAuth from '@/hooks/auth/useAuth' instead.
 */
import { useState } from 'react';
import { useAuth } from './useAuth';

/**
 * Compatibility layer for the deprecated useAuthService hook
 * @deprecated Use useAuth from '@/hooks/auth/useAuth' instead
 */
export function useAuthService() {
  console.warn(
    'useAuthService is deprecated and will be removed in a future version. ' +
    'Please use useAuth from @/hooks/auth/useAuth.ts instead.'
  );
  
  const auth = useAuth();
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  
  // Create a compatibility layer that mimics the old useAuthService API
  return {
    isLoading: auth.isLoading,
    currentOperation,
    
    // Sign in with email and password
    signInWithEmail: async (email: string, password: string) => {
      setCurrentOperation('signIn');
      try {
        await auth.login(email, password);
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error };
      } finally {
        setCurrentOperation(null);
      }
    },
    
    // Sign up with email and password
    signUpWithEmail: async (email: string, password: string) => {
      setCurrentOperation('signUp');
      try {
        await auth.register(email, password, 'customer');
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error };
      } finally {
        setCurrentOperation(null);
      }
    },
    
    // Sign in with Google
    signInWithGoogle: async () => {
      setCurrentOperation('googleSignIn');
      try {
        const result = await auth.signInWithGoogle();
        return { success: !result.error, error: result.error };
      } catch (error) {
        return { success: false, error };
      } finally {
        setCurrentOperation(null);
      }
    },
    
    // Sign out
    signOut: async () => {
      setCurrentOperation('signOut');
      try {
        await auth.signOut();
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error };
      } finally {
        setCurrentOperation(null);
      }
    },
    
    // Reset password
    resetPassword: async (email: string) => {
      setCurrentOperation('resetPassword');
      try {
        const result = await auth.resetPassword(email);
        return { success: !result.error, error: result.error };
      } catch (error) {
        return { success: false, error };
      } finally {
        setCurrentOperation(null);
      }
    }
  };
}

