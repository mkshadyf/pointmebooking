/**
 * @deprecated This service is deprecated. Use the comprehensive auth service from '@/lib/supabase/services/auth/auth.service.ts' instead.
 * This file now serves as a compatibility layer that forwards calls to the comprehensive auth service.
 */

import { authService as comprehensiveAuthService } from '@/lib/supabase/services/auth/auth.service';
import { AuthError as CustomAuthError } from '@/types/database/auth';
import { createClient, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { ToastService } from '../toast';

// Create a temporary supabase client - in a real implementation, you would import this from your client file

export interface AuthResult {
  success: boolean;
  error?: Error | null;
  data?: any;
}

/**
 * @deprecated This service is deprecated. Use the comprehensive auth service from '@/lib/supabase/services/auth/auth.service.ts' instead.
 * This class now serves as a compatibility layer that forwards calls to the comprehensive auth service.
 */
export class AuthService {
  /**
   * Sign in with email and password
   * @deprecated Use authService.login() from '@/lib/supabase/services/auth/auth.service.ts' instead
   */
  static async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Forward to comprehensive auth service
      const { data, error } = await comprehensiveAuthService.login({ email, password });

      if (error) {
        return this.handleCustomAuthError(error, 'Failed to sign in');
      }

      ToastService.success('Signed in successfully');
      return { success: true, data };
    } catch (error) {
      return this.handleUnexpectedError(error, 'An unexpected error occurred during sign in');
    }
  }

  /**
   * Sign up with email and password
   * @deprecated Use authService.register() from '@/lib/supabase/services/auth/auth.service.ts' instead
   */
  static async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Forward to comprehensive auth service
      const { data, error } = await comprehensiveAuthService.register({ 
        email, 
        password, 
        role: 'customer' // Default role
      });

      if (error) {
        return this.handleCustomAuthError(error, 'Sign up failed');
      }

      ToastService.success('Account created successfully. Please check your email to confirm your account.');
      return { success: true, data };
    } catch (error) {
      return this.handleUnexpectedError(error, 'Sign up failed');
    }
  }

  /**
   * Sign in with Google OAuth
   * @deprecated Use authService.signInWithOAuth() from '@/lib/supabase/services/auth/auth.service.ts' instead
   */
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      // Forward to comprehensive auth service
      const { data, error } = await comprehensiveAuthService.signInWithOAuth('google');

      if (error) {
        return this.handleCustomAuthError(error, 'Google sign in failed');
      }

      return { success: true, data };
    } catch (error) {
      return this.handleUnexpectedError(error, 'Google sign in failed');
    }
  }

  /**
   * Sign out the current user
   * @deprecated Use authService.logout() from '@/lib/supabase/services/auth/auth.service.ts' instead
   */
  static async signOut(): Promise<AuthResult> {
    try {
      // Forward to comprehensive auth service
      const { error } = await comprehensiveAuthService.logout();

      if (error) {
        return this.handleCustomAuthError(error, 'Sign out failed');
      }

      ToastService.success('Signed out successfully');
      return { success: true };
    } catch (error) {
      return this.handleUnexpectedError(error, 'Sign out failed');
    }
  }

  /**
   * Reset password
   * @deprecated Use authService.resetPassword() from '@/lib/supabase/services/auth/auth.service.ts' instead
   */
  static async resetPassword(email: string): Promise<AuthResult> {
    try {
      // Forward to comprehensive auth service
      const { error } = await comprehensiveAuthService.resetPassword(email);

      if (error) {
        return this.handleCustomAuthError(error, 'Password reset failed');
      }

      ToastService.success('Password reset email sent. Please check your inbox.');
      return { success: true };
    } catch (error) {
      return this.handleUnexpectedError(error, 'Password reset failed');
    }
  }


  /**
   * Handle custom auth errors from the comprehensive auth service
   * @private
   */
  private static handleCustomAuthError(error: CustomAuthError, defaultMessage: string): AuthResult {
    console.debug('Auth error:', error);
    
    let userMessage = defaultMessage;
    if (error.message) {
      if (error.message.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password';
      } else {
        userMessage = error.message;
      }
    }
    
    try {
      ToastService.error(userMessage);
    } catch (toastError) {
      console.warn('Failed to show toast notification:', toastError);
    }
    
    return {
      success: false,
      error: new Error(userMessage),
    };
  }

  /**
   * Handle unexpected errors
   * @private
   */
  private static handleUnexpectedError(error: any, defaultMessage: string): AuthResult {
    console.error('Unexpected auth error:', error);
    
    try {
      ToastService.error(defaultMessage);
    } catch (toastError) {
      console.warn('Failed to show toast notification:', toastError);
    }
    
    return {
      success: false,
      error: new Error(defaultMessage),
    };
  }
} 