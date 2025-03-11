/**
 * @deprecated This hook is deprecated. Use the useAuth hook from '@/hooks/auth/useAuth.ts' instead.
 * This hook now serves as a compatibility layer that forwards calls to the comprehensive auth service.
 */

import { authService } from '@/lib/supabase/services/auth/auth.service';
import { useState } from 'react';

// Define AuthResult type for compatibility
interface AuthResult {
  success: boolean;
  error?: Error | null;
  data?: any;
}

// Simple implementation of authState to avoid dependency on the old module
const useAuthState = () => {
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<string | null>(null);
  
  return {
    loading,
    setLoading,
    operation,
    setOperation
  };
};

/**
 * Hook to integrate the AuthService with React components
 * Provides methods for authentication operations with loading states
 * 
 * @deprecated This hook is deprecated. Use the useAuth hook from '@/hooks/auth/useAuth.ts' instead.
 * This hook now serves as a compatibility layer that forwards calls to the comprehensive auth service.
 */
export function useAuthService() {
  console.warn(
    'useAuthService is deprecated and will be removed in a future version. ' +
    'Please use useAuth from @/hooks/auth/useAuth.ts instead.'
  );
  
  const { setLoading, setOperation } = useAuthState();
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  
  /**
   * Wrapper function to handle loading states for auth operations
   */
  const withLoading = async (
    operation: string,
    callback: () => Promise<AuthResult>
  ): Promise<AuthResult> => {
    try {
      // Set loading states
      setIsLoading(true);
      setLoading(true);
      setOperation(operation);
      setCurrentOperation(operation);
      
      // Execute the operation
      const result = await callback();
      
      return result;
    } finally {
      // Clear loading states
      setIsLoading(false);
      setLoading(false);
      setOperation(null);
      setCurrentOperation(null);
    }
  };
  
  // Helper function to convert comprehensive auth service response to AuthResult
  const convertResponse = async (promise: Promise<any>): Promise<AuthResult> => {
    try {
      const { data, error } = await promise;
      
      if (error) {
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };
  
  return {
    isLoading,
    currentOperation,
    
    // Sign in with email and password
    signInWithEmail: (email: string, password: string) => 
      withLoading('signIn', () => convertResponse(authService.login({ email, password }))),
    
    // Sign up with email and password
    signUpWithEmail: (email: string, password: string) => 
      withLoading('signUp', () => convertResponse(authService.register({ email, password, role: 'customer' }))),
    
    // Sign in with Google
    signInWithGoogle: () => 
      withLoading('googleSignIn', () => convertResponse(authService.signInWithOAuth('google'))),
    
    // Sign out
    signOut: () => 
      withLoading('signOut', () => convertResponse(authService.logout())),
    
    // Reset password
    resetPassword: (email: string) => 
      withLoading('resetPassword', () => convertResponse(authService.resetPassword(email)))
  };
} 