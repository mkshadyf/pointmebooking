/**
 * Auth Service
 * Centralized service for handling authentication operations with Supabase
 * Integrates with our error handling system to properly handle empty errors
 */

import { AuthError } from '@supabase/supabase-js';
import { interceptError, isEmptyError } from '../error/error-interceptor';
import { trackError } from '../error/error-monitoring';
import { supabase } from '../supabase/client';

// Helper function to create consistent auth errors
function createAuthError(message: string, _code: string): AuthError {
  // AuthError constructor requires a message and status code
  // We're using 400 as a default for client errors
  return new AuthError(message, 400);
}

export class AuthService {
  /**
   * Sign in with email and password
   * @param email User's email
   * @param password User's password
   * @returns User data or throws an error
   */
  static async signInWithEmail(email: string, password: string) {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Check for errors in Supabase response
      if (result.error) {
        // Use our error interception system
        const source = 'AuthService:signInWithEmail';
        
        // Log debug information
        console.debug('[AUTH] Received error from Supabase signInWithPassword', {
          errorType: typeof result.error,
          isEmpty: isEmptyError(result.error),
          errorKeys: result.error && typeof result.error === 'object' ? Object.keys(result.error) : [],
          timestamp: new Date().toISOString(),
          hasMessage: !!result.error?.message
        });
        
        // Track the error properly
        if (isEmptyError(result.error)) {
          console.warn('[AUTH] Empty Supabase error detected', {
            email,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
          });
          
          // Create a new AuthError for empty errors
          const enhancedError = createAuthError(
            `Empty error during authentication for email: ${email.substring(0, 3)}***`,
            'unknown_auth_error'
          );
          
          // Track it with our interceptor
          trackError(enhancedError, {
            source,
            context: { 
              email, 
              action: 'signInWithEmail',
              supabaseOperation: 'signInWithPassword',
              timestamp: new Date().toISOString(),
              wasEmpty: true,
              errorCode: 'unknown_auth_error'
            }
          });
          
          throw enhancedError;
        }
        
        // Track the error
        trackError(result.error, {
          source,
          context: { email, action: 'signInWithEmail' }
        });
        
        // Ensure we have a proper error object
        throw result.error;
      }
      
      return result.data;
    } catch (error) {
      // Catch any unexpected errors
      const source = 'AuthService:signInWithEmail:catch';
      
      // Handle non-AuthError types
      if (!(error instanceof AuthError)) {
        let processedError = error;
        
        if (isEmptyError(processedError)) {
          // Create a proper AuthError
          processedError = createAuthError(
            `Error during authentication for email: ${email.substring(0, 3)}***`,
            'client_auth_error'
          );
          
          // Add context through our tracking system
          trackError(processedError, {
            source,
            context: { 
              email,
              action: 'signInWithEmail:catch',
              wasEmpty: true,
              errorCode: 'client_auth_error'
            }
          });
        } else {
          // Track non-empty, non-AuthError errors
          trackError(processedError, {
            source,
            context: { 
              email, 
              action: 'signInWithEmail:catch' 
            }
          });
        }
        
        throw processedError;
      }
      
      // For AuthError, just track it
      trackError(error, {
        source,
        context: { email, action: 'signInWithEmail:catch' }
      });
      
      throw error;
    }
  }

  /**
   * Sign up with email and password
   * @param email User's email
   * @param password User's password
   * @returns User data or throws an error
   */
  static async signUp(email: string, password: string) {
    try {
      const result = await supabase.auth.signUp({
        email,
        password
      });

      if (result.error) {
        const source = 'AuthService:signUp';
        
        // Log debug information
        console.debug('[AUTH] Received error from Supabase signUp', {
          errorType: typeof result.error,
          isEmpty: isEmptyError(result.error),
          errorKeys: result.error && typeof result.error === 'object' ? Object.keys(result.error) : [],
          timestamp: new Date().toISOString(),
          hasMessage: !!result.error?.message
        });
        
        if (isEmptyError(result.error)) {
          console.warn('[AUTH] Empty Supabase error detected during signup', {
            email,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
          });
          
          // Create a new AuthError for empty errors
          const enhancedError = createAuthError(
            `Empty error during signup for email: ${email.substring(0, 3)}***`,
            'unknown_signup_error'
          );
          
          // Track it with our system
          trackError(enhancedError, {
            source,
            context: { 
              email, 
              action: 'signUp',
              timestamp: new Date().toISOString(),
              wasEmpty: true,
              errorCode: 'unknown_signup_error'
            }
          });
          
          throw enhancedError;
        }
        
        // Track the error
        trackError(result.error, {
          source,
          context: { email, action: 'signUp' }
        });
        
        throw result.error;
      }
      
      return result.data;
    } catch (error) {
      const source = 'AuthService:signUp:catch';
      
      // Handle non-AuthError types
      if (!(error instanceof AuthError)) {
        let processedError = error;
        
        if (isEmptyError(processedError)) {
          // Create a proper AuthError
          processedError = createAuthError(
            `Error during signup for email: ${email.substring(0, 3)}***`,
            'client_signup_error'
          );
          
          // Add context through our tracking system
          trackError(processedError, {
            source,
            context: { 
              email,
              action: 'signUp:catch',
              wasEmpty: true,
              errorCode: 'client_signup_error'
            }
          });
        } else {
          // Track non-empty, non-AuthError errors
          trackError(processedError, {
            source,
            context: { 
              email, 
              action: 'signUp:catch' 
            }
          });
        }
        
        throw processedError;
      }
      
      // For AuthError, just track it
      trackError(error, {
        source,
        context: { email, action: 'signUp:catch' }
      });
      
      throw error;
    }
  }

  /**
   * Sign out the current user
   * @returns true if signed out successfully or throws an error
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        const source = 'AuthService:signOut';
        
        // Log debug information
        console.debug('[AUTH] Received error from Supabase signOut', {
          errorType: typeof error,
          isEmpty: isEmptyError(error),
          errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
          timestamp: new Date().toISOString(),
          hasMessage: !!error?.message
        });
        
        if (isEmptyError(error)) {
          // Create a new AuthError for empty errors
          const enhancedError = createAuthError(
            'Empty error during sign out',
            'unknown_signout_error'
          );
          
          // Track it with our system
          trackError(enhancedError, {
            source,
            context: { 
              action: 'signOut',
              timestamp: new Date().toISOString(),
              wasEmpty: true,
              errorCode: 'unknown_signout_error'
            }
          });
          
          throw enhancedError;
        }
        
        // Track the error
        trackError(error, {
          source,
          context: { action: 'signOut' }
        });
        
        throw error;
      }
      
      return true;
    } catch (error) {
      const source = 'AuthService:signOut:catch';
      
      // Handle non-AuthError types
      if (!(error instanceof AuthError)) {
        let processedError = error;
        
        if (isEmptyError(processedError)) {
          // Create a proper AuthError
          processedError = createAuthError(
            'Error during sign out',
            'client_signout_error'
          );
          
          // Add context through our tracking system
          trackError(processedError, {
            source,
            context: { 
              action: 'signOut:catch',
              timestamp: new Date().toISOString(),
              wasEmpty: true,
              errorCode: 'client_signout_error'
            }
          });
        } else {
          // Track non-empty, non-AuthError errors
          trackError(processedError, {
            source,
            context: { 
              action: 'signOut:catch' 
            }
          });
        }
        
        throw processedError;
      }
      
      // For AuthError, just track it
      trackError(error, {
        source,
        context: { action: 'signOut:catch' }
      });
      
      throw error;
    }
  }

  /**
   * Get the current user
   * @returns Current user or null if not authenticated
   */
  static async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        const source = 'AuthService:getCurrentUser';
        
        // Log debug information
        console.debug('[AUTH] Received error from Supabase getUser', {
          errorType: typeof error,
          isEmpty: isEmptyError(error),
          errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
          timestamp: new Date().toISOString(),
          hasMessage: !!error?.message
        });
        
        if (isEmptyError(error)) {
          // Create a new AuthError for empty errors
          const enhancedError = createAuthError(
            'Empty error during user fetch',
            'unknown_user_fetch_error'
          );
          
          // Track it with our system
          trackError(enhancedError, {
            source,
            context: { 
              action: 'getCurrentUser',
              timestamp: new Date().toISOString(),
              wasEmpty: true,
              errorCode: 'unknown_user_fetch_error'
            }
          });
          
          throw enhancedError;
        }
        
        // Track the error
        trackError(error, {
          source,
          context: { action: 'getCurrentUser' }
        });
        
        throw error;
      }
      
      return data.user;
    } catch (error) {
      const source = 'AuthService:getCurrentUser:catch';
      
      // For getCurrentUser, we'll log the error but return null instead of throwing
      // This allows the app to treat auth errors as "not logged in" which is safer
      
      if (!(error instanceof AuthError)) {
        let processedError = error;
        
        if (isEmptyError(processedError)) {
          // Create a proper AuthError but don't throw it
          processedError = createAuthError(
            'Error during user fetch',
            'client_user_fetch_error'
          );
        }
        
        // Track the error
        trackError(processedError, {
          source,
          context: { 
            action: 'getCurrentUser:catch',
            timestamp: new Date().toISOString(),
            wasEmpty: isEmptyError(error),
            errorCode: 'client_user_fetch_error'
          }
        });
      } else {
        // Track the error
        trackError(error, {
          source,
          context: { action: 'getCurrentUser:catch' }
        });
      }
      
      // Don't rethrow for getCurrentUser - just return null
      console.warn('[AUTH] Error getting current user - treating as logged out', {
        errorType: typeof error,
        isAuthError: error instanceof AuthError,
        isEmpty: isEmptyError(error),
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }
  
  /**
   * Send password reset email
   * @param email User's email
   * @returns true if email sent successfully or throws an error
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        const source = 'AuthService:resetPassword';
        
        // Log debug information
        console.debug('[AUTH] Received error from Supabase resetPasswordForEmail', {
          errorType: typeof error,
          isEmpty: isEmptyError(error),
          errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
          timestamp: new Date().toISOString(),
          hasMessage: !!error?.message
        });
        
        if (isEmptyError(error)) {
          // Create a new AuthError for empty errors
          const enhancedError = createAuthError(
            `Empty error during password reset for email: ${email.substring(0, 3)}***`,
            'unknown_password_reset_error'
          );
          
          // Track it with our system
          trackError(enhancedError, {
            source,
            context: { 
              email,
              action: 'resetPassword',
              timestamp: new Date().toISOString(),
              wasEmpty: true,
              errorCode: 'unknown_password_reset_error'
            }
          });
          
          throw enhancedError;
        }
        
        // Track the error
        trackError(error, {
          source,
          context: { email, action: 'resetPassword' }
        });
        
        throw error;
      }
      
      return true;
    } catch (error) {
      const source = 'AuthService:resetPassword:catch';
      
      // Handle non-AuthError types
      if (!(error instanceof AuthError)) {
        let processedError = error;
        
        if (isEmptyError(processedError)) {
          // Create a proper AuthError
          processedError = createAuthError(
            `Error during password reset for email: ${email.substring(0, 3)}***`,
            'client_password_reset_error'
          );
          
          // Add context through our tracking system
          trackError(processedError, {
            source,
            context: { 
              email,
              action: 'resetPassword:catch',
              timestamp: new Date().toISOString(),
              wasEmpty: true,
              errorCode: 'client_password_reset_error'
            }
          });
        } else {
          // Track non-empty, non-AuthError errors
          trackError(processedError, {
            source,
            context: { 
              email, 
              action: 'resetPassword:catch' 
            }
          });
        }
        
        throw processedError;
      }
      
      // For AuthError, just track it
      trackError(error, {
        source,
        context: { email, action: 'resetPassword:catch' }
      });
      
      throw error;
    }
  }

  // Sign in with OAuth provider (Google, GitHub, etc.)
  static async signInWithOAuth(provider: 'google' | 'github' | 'facebook') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (error) {
        const source = 'AuthService:signInWithOAuth';
        if (isEmptyError(error)) {
          const interceptedError = interceptError(error, source, { provider, action: 'signInWithOAuth' });
          trackError(interceptedError, {
            source,
            context: { provider, action: 'signInWithOAuth' }
          });
          throw interceptedError;
        }
        
        trackError(error, {
          source,
          context: { provider, action: 'signInWithOAuth' }
        });
        throw error;
      }
      
      return data;
    } catch (error) {
      const source = 'AuthService:signInWithOAuth:catch';
      if (isEmptyError(error)) {
        const interceptedError = interceptError(error, source, { provider });
        trackError(interceptedError, {
          source,
          context: { provider }
        });
        throw interceptedError;
      }
      
      trackError(error, {
        source,
        context: { provider }
      });
      
      throw error;
    }
  }

  // Update user
  static async updateUser(updates: { email?: string; password?: string; data?: Record<string, any> }) {
    try {
      const { data, error } = await supabase.auth.updateUser(updates);
      
      if (error) {
        const source = 'AuthService:updateUser';
        if (isEmptyError(error)) {
          const interceptedError = interceptError(error, source, { ...updates, action: 'updateUser' });
          trackError(interceptedError, {
            source,
            context: { ...updates, action: 'updateUser' }
          });
          throw interceptedError;
        }
        
        trackError(error, {
          source,
          context: { ...updates, action: 'updateUser' }
        });
        throw error;
      }
      
      return data;
    } catch (error) {
      const source = 'AuthService:updateUser:catch';
      if (isEmptyError(error)) {
        const interceptedError = interceptError(error, source, { ...updates });
        trackError(interceptedError, {
          source,
          context: { ...updates }
        });
        throw interceptedError;
      }
      
      trackError(error, {
        source,
        context: { ...updates, action: 'updateUser' }
      });
      
      throw error;
    }
  }
}

// Create a singleton instance
const instance = {
  signInWithEmail: AuthService.signInWithEmail,
  signUp: AuthService.signUp,
  signOut: AuthService.signOut,
  getCurrentUser: AuthService.getCurrentUser,
  resetPassword: AuthService.resetPassword
};

// Export the singleton for easier usage
export default instance; 