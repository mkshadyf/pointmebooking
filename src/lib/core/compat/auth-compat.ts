/**
 * Compatibility layer for the auth service
 * 
 * This file provides backward compatibility with the old authFeedback module
 * to ease the transition to the new core services.
 * 
 * @deprecated This module will be removed on 2024-10-01. Use services from '@/lib/supabase/services/auth/auth.service.ts' directly instead.
 * See AUTH_COMPAT_REMOVAL_PLAN.md for details on the removal timeline.
 */

import { authService } from '@/lib/supabase/services/auth/auth.service';
import { ErrorService } from '../error';
import { ToastService } from '../toast';

// Log a warning when this module is imported
const showDeprecationWarning = () => {
  console.warn(
    'The auth compatibility functions from @/lib/core/compat/auth-compat.ts are deprecated and will be removed on 2024-10-01. ' +
    'Use authService methods directly instead. ' +
    'See AUTH_COMPAT_REMOVAL_PLAN.md for details.'
  );
};

// Show warning on import
showDeprecationWarning();

/**
 * Compatibility function for withAuthFeedback
 * 
 * @deprecated This function will be removed on 2024-10-01. Use authService methods directly instead.
 */
export const withAuthFeedback = async <T,>(
  operation: string,
  fn: () => Promise<T>,
  successMessage?: string,
  debugInfo?: Record<string, any>
): Promise<T> => {
  // Show deprecation warning on usage
  console.warn(
    'withAuthFeedback is deprecated and will be removed on 2024-10-01. ' +
    'Use authService methods directly instead. ' +
    'See AUTH_COMPAT_REMOVAL_PLAN.md for details.'
  );
  
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
 * @deprecated This function will be removed on 2024-10-01. Use authService methods directly instead.
 */
export const handleAuthFeedback = async (
  operation: string,
  error: any = null,
  successMessage?: string,
  debugInfo?: Record<string, any>
) => {
  // Show deprecation warning on usage
  console.warn(
    'handleAuthFeedback is deprecated and will be removed on 2024-10-01. ' +
    'Use authService methods directly instead. ' +
    'See AUTH_COMPAT_REMOVAL_PLAN.md for details.'
  );
  
  if (error) {
    // Log the error with debug info
    ErrorService.handleError(error, {
      context: `Auth operation: ${operation}`,
      additionalData: debugInfo
    });
    
    // Show error message
    ToastService.error(error.message || `Error during ${operation}`);
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
 * @deprecated Use authService directly instead
 */
export const auth = {
  /**
   * Sign in with email and password
   * @deprecated Use authService.login directly instead
   */
  signInWithEmail: async (email: string, password: string, options?: { 
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
  }) => {
    const showToast = options?.showToast !== false;
    const successMessage = options?.successMessage || 'Signed in successfully';
    
    try {
      const { data, error } = await authService.login({ email, password });
      
      if (!error) {
        if (showToast) {
          ToastService.success(successMessage);
        }
        return { success: true, data };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error };
    }
  },
  
  /**
   * Sign up with email and password
   * @deprecated Use authService.register directly instead
   */
  signUpWithEmail: async (email: string, password: string, options?: {
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
  }) => {
    const showToast = options?.showToast !== false;
    const successMessage = options?.successMessage || 'Account created successfully';
    
    try {
      const { data, error } = await authService.register({ 
        email, 
        password, 
        role: 'customer' // Default role
      });
      
      if (!error) {
        if (showToast) {
          ToastService.success(successMessage);
        }
        return { success: true, data };
      } else {
        if (showToast) {
          ToastService.error(error.message || 'An error occurred');
        }
        return { success: false, error };
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
   * @deprecated Use authService.logout directly instead
   */
  signOut: async (options?: {
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
  }) => {
    const showToast = options?.showToast !== false;
    const successMessage = options?.successMessage || 'Signed out successfully';
    
    try {
      const { error } = await authService.logout();
      
      if (!error) {
        if (showToast) {
          ToastService.success(successMessage);
        }
        return { success: true };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error };
    }
  }
}; 