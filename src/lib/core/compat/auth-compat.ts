/**
 * Compatibility layer for the auth service
 * 
 * This file provides backward compatibility with the old authFeedback module
 * to ease the transition to the new core services.
 */

import { AuthService } from '../auth';
import { ErrorService } from '../error';
import { ToastService } from '../toast';

/**
 * Compatibility function for withAuthFeedback
 * 
 * @deprecated Use AuthService directly instead
 */
export const withAuthFeedback = async <T,>(
  operation: string,
  fn: () => Promise<T>,
  successMessage?: string,
  debugInfo?: Record<string, any>
): Promise<T> => {
  try {
    // Execute the operation
    const result = await fn();
    
    // Show success message if provided
    if (successMessage) {
      ToastService.success(successMessage);
    }
    
    return result;
  } catch (error) {
    // Log the error with debug info
    ErrorService.handleError(error, {
      context: `Auth operation: ${operation}`,
      additionalData: debugInfo
    });
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

/**
 * Compatibility function for handleAuthFeedback
 * 
 * @deprecated Use AuthService directly instead
 */
export const handleAuthFeedback = async (
  operation: string,
  error: any = null,
  successMessage?: string,
  debugInfo?: Record<string, any>
) => {
  if (error) {
    // Handle error
    ErrorService.handleError(error, {
      context: `Auth operation: ${operation}`,
      additionalData: debugInfo
    });
    
    // Show error toast
    ToastService.error(error.message || 'An error occurred');
  } else if (successMessage) {
    // Show success message
    ToastService.success(successMessage);
  }
};

/**
 * Re-export the AUTH_ERROR_MESSAGES for compatibility
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password. Please try again.',
  'Email not confirmed': 'Please verify your email before signing in.',
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  // Add more mappings as needed
};

/**
 * Legacy auth functions for backward compatibility
 * @deprecated Use AuthService directly instead
 */
export const auth = {
  /**
   * Sign in with email and password
   * @deprecated Use AuthService.signInWithEmail directly instead
   */
  signInWithEmail: async (email: string, password: string, options?: { 
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
  }) => {
    const showToast = options?.showToast !== false;
    const successMessage = options?.successMessage || 'Signed in successfully';
    
    try {
      const result = await AuthService.signInWithEmail(email, password);
      
      if (result.success) {
        if (showToast) {
          ToastService.success(successMessage);
        }
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error };
    }
  },
  
  /**
   * Sign up with email and password
   * @deprecated Use AuthService.signUpWithEmail directly instead
   */
  signUpWithEmail: async (email: string, password: string, options?: {
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
  }) => {
    const showToast = options?.showToast !== false;
    const successMessage = options?.successMessage || 'Account created successfully';
    
    try {
      const result = await AuthService.signUpWithEmail(email, password);
      
      if (result.success) {
        if (showToast) {
          ToastService.success(successMessage);
        }
        return { success: true, data: result.data };
      } else {
        if (showToast && result.error) {
          ToastService.error(result.error.message || 'An error occurred');
        }
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      if (showToast) {
        ToastService.error(error.message || 'An error occurred');
      }
      return { success: false, error };
    }
  },
  
  /**
   * Sign out
   * @deprecated Use AuthService.signOut directly instead
   */
  signOut: async (options?: {
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
  }) => {
    const showToast = options?.showToast !== false;
    const successMessage = options?.successMessage || 'Signed out successfully';
    
    try {
      const result = await AuthService.signOut();
      
      if (result.success) {
        if (showToast) {
          ToastService.success(successMessage);
        }
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error };
    }
  }
}; 