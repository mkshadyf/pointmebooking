'use client';

import { create } from 'zustand';
import { logError } from '../error/error-logger';

// Define ToastType to match the useToast hook
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Create a wrapper for the showToast function
const showToast = (options: { 
  type: ToastType; 
  title: string; 
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}) => {
  // This is a workaround since we can't use hooks outside React components
  // In a real implementation, we would use a proper toast system that works outside React
  // For now, we'll use console.log as a fallback
  console.log(`[Toast] ${options.type}: ${options.title} - ${options.message}`);
  
  // In a browser environment, we might try to use global toast notification systems
  if (typeof window !== 'undefined') {
    // Try to show a browser notification if available and permitted
    try {
      if (window.Notification && Notification.permission === 'granted') {
        new Notification(options.title, { body: options.message });
      }
    } catch (e) {
      // Silent fail - this is just a fallback
    }
  }
};

// Network status store
export const useNetworkStatus = create<{
  isOnline: boolean;
  setOnline: (status: boolean) => void;
}>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setOnline: (status) => set({ isOnline: status }),
}));

// Auth state store
export const useAuthState = create<{
  isLoading: boolean;
  currentOperation: string | null;
  setLoading: (isLoading: boolean, operation?: string | null) => void;
  setCurrentOperation: (operation: string | null) => void;
}>((set) => ({
  isLoading: false,
  currentOperation: null,
  setLoading: (isLoading, operation = null) => set({ isLoading, currentOperation: operation }),
  setCurrentOperation: (operation) => set({ currentOperation: operation }),
}));

// Initialize network listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useNetworkStatus.getState().setOnline(true);
    showToast({
      type: 'success',
      title: 'Connection Restored',
      message: 'You are back online.',
      duration: 3000,
    });
  });

  window.addEventListener('offline', () => {
    useNetworkStatus.getState().setOnline(false);
    showToast({
      type: 'error',
      title: 'Connection Lost',
      message: 'You are currently offline. Authentication operations may fail.',
      duration: 0, // Persist until online
    });
  });
}

// Error message mappings
const errorMessages: Record<string, { message: string; type: ToastType; title: string }> = {
  'auth/invalid-email': {
    message: 'Please enter a valid email address.',
    type: 'error',
    title: 'Invalid Email',
  },
  'auth/user-not-found': {
    message: 'No account found with this email address.',
    type: 'error',
    title: 'User Not Found',
  },
  'auth/wrong-password': {
    message: 'Incorrect password. Please try again.',
    type: 'error',
    title: 'Login Failed',
  },
  'auth/email-already-in-use': {
    message: 'This email is already registered. Try logging in instead.',
    type: 'error',
    title: 'Email In Use',
  },
  'auth/weak-password': {
    message: 'Password is too weak. Use at least 8 characters with letters, numbers, and symbols.',
    type: 'error',
    title: 'Weak Password',
  },
  'auth/timeout': {
    message: 'Request timed out. Check your internet connection and try again.',
    type: 'error',
    title: 'Timeout',
  },
  'auth/network-error': {
    message: 'Network error. Check your connection and try again.',
    type: 'error',
    title: 'Network Error',
  },
  'auth/too-many-requests': {
    message: 'Too many attempts. Please try again later.',
    type: 'warning',
    title: 'Too Many Attempts',
  },
  'auth/empty-error': {
    message: 'Authentication failed. Please check your credentials and try again.',
    type: 'error',
    title: 'Authentication Error',
  },
  'auth/invalid-credentials': {
    message: 'Invalid email or password. Please check your credentials and try again.',
    type: 'error',
    title: 'Login Failed',
  },
  'auth/error-string': {
    message: 'An error occurred during authentication. Please try again.',
    type: 'error',
    title: 'Authentication Error',
  },
  'auth/unknown-error': {
    message: 'An unexpected error occurred. Please try again later.',
    type: 'error',
    title: 'Error',
  },
  'auth/password-mismatch': {
    message: 'Passwords do not match.',
    type: 'error',
    title: 'Password Mismatch',
  },
  'auth/expired-session': {
    message: 'Your session has expired. Please login again.',
    type: 'warning',
    title: 'Session Expired',
  },
  'auth/server-error': {
    message: 'Server error. Please try again later.',
    type: 'error',
    title: 'Server Error',
  },
  // Default fallback
  'default': {
    message: 'An unexpected error occurred. Please try again.',
    type: 'error',
    title: 'Authentication Error',
  },
};

// Extract error code from various error formats
export const getErrorCode = (error: any): string => {
  // Handle null, undefined, or empty objects
  if (!error) return 'default';
  if (typeof error === 'object' && Object.keys(error).length === 0) return 'auth/empty-error';
  if (typeof error === 'string') return error;
  
  // Use the code property if it exists
  if (error.code) {
    // If code already starts with auth/, return as is
    if (typeof error.code === 'string' && error.code.startsWith('auth/')) {
      return error.code;
    }
    // Otherwise, prefix with auth/
    return `auth/${error.code}`;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for network errors
    if (message.includes('network') || message.includes('internet') || message.includes('offline')) {
      return 'auth/network-error';
    }
    
    // Check for timeout
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'auth/timeout';
    }
    
    // Check for invalid credentials
    if (message.includes('invalid') && 
        (message.includes('credentials') || message.includes('email') || message.includes('password'))) {
      return 'auth/invalid-credentials';
    }

    // Extract error code if it exists in the message
    const codeMatch = message.match(/auth\/[\w-]+/);
    if (codeMatch) return codeMatch[0];
  }

  // Handle error objects with messages but no code
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid') && 
        (message.includes('credentials') || message.includes('email') || message.includes('password'))) {
      return 'auth/invalid-credentials';
    }
    
    if (message.includes('network') || message.includes('internet') || message.includes('offline')) {
      return 'auth/network-error';
    }
  }

  return 'default';
};

// Main feedback handler
export const handleAuthFeedback = async (
  operation: string,
  error: any = null,
  successMessage?: string,
  debugInfo?: Record<string, any>
) => {
  const { setLoading } = useAuthState.getState();
  
  // Clear loading state
  setLoading(false);
  
  // If no error and we have a success message, show success toast
  if (!error && successMessage) {
    showToast({
      type: 'success',
      title: 'Success',
      message: successMessage,
      duration: 4000,
    });
    return;
  }
  
  // Handle errors
  if (error) {
    // Ensure error has at least a message
    if (!error.message && typeof error === 'object') {
      // For authentication errors with no message, add a default message based on operation
      if (operation === 'login') {
        error.message = 'Invalid email or password. Please check your credentials and try again.';
        error.code = 'auth/invalid-credentials';
      } else {
        error.message = `An error occurred during ${operation}. Please try again.`;
        error.code = 'auth/unknown-error';
      }
    } else if (typeof error === 'string') {
      // Convert string errors to error objects
      const errorMessage = error;
      error = {
        message: errorMessage,
        code: 'auth/error-string'
      };
    }

    // Log the error for developers with additional debug info
    await logError(error, operation, debugInfo);
    
    // Extract error code
    const errorCode = getErrorCode(error);
    
    // Get mapped error message or use default
    const errorInfo = errorMessages[errorCode] || errorMessages['default'];
    
    // Show toast with error details
    showToast({
      type: errorInfo.type,
      title: errorInfo.title,
      message: errorInfo.message,
      duration: 5000, // Longer duration for errors
      action: errorCode === 'auth/network-error' ? {
        label: 'Retry',
        onClick: () => window.location.reload()
      } : undefined
    });
  }
};

// Auth operation wrapper that handles loading state and feedback
export const withAuthFeedback = async <T,>(
  operation: string,
  fn: () => Promise<T>,
  successMessage?: string,
  debugInfo?: Record<string, any>
): Promise<T> => {
  const { setLoading, setCurrentOperation } = useAuthState.getState();
  
  try {
    // Set loading state
    setLoading(true);
    setCurrentOperation(operation);
    
    // Execute the function with timeout handling
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000);
      }),
    ]);
    
    // Handle successful operation
    await handleAuthFeedback(operation, null, successMessage, debugInfo);
    return result;
  } catch (error) {
    // Enhance error with context for better debugging
    const enhancedError = error instanceof Error 
      ? error 
      : typeof error === 'object' && error !== null
        ? error
        : new Error(String(error));
    
    // Add operation context to error
    if (typeof enhancedError === 'object') {
      // Use type assertion for dynamic properties
      (enhancedError as any).operation = operation;
      (enhancedError as any).timestamp = new Date().toISOString();
      
      // Add debug info to error object if available
      if (debugInfo) {
        (enhancedError as any).debugInfo = debugInfo;
      }
    }
    
    // Handle error feedback
    await handleAuthFeedback(operation, enhancedError, undefined, debugInfo);
    throw error;
  }
};

// Auth debug utilities for developers
export const authDebug = {
  // Simulate different auth errors
  simulateError: (errorCode: string) => {
    const error = new Error(`Simulated error: ${errorCode}`);
    error.name = errorCode;
    handleAuthFeedback('debug', error);
  },
  
  // Log current auth state
  logState: () => {
    console.group('🔐 Auth Debug Information');
    console.log('Network Status:', useNetworkStatus.getState().isOnline ? 'Online' : 'Offline');
    console.log('Auth Loading State:', useAuthState.getState());
    console.groupEnd();
    
    showToast({
      type: 'info',
      title: 'Auth Debug',
      message: 'Auth debug info logged to console',
      duration: 3000,
    });
  },
  
  // Force loading state (for testing UI)
  simulateLoading: (duration = 3000, operation = 'test') => {
    const { setLoading } = useAuthState.getState();
    setLoading(true, operation);
    
    showToast({
      type: 'loading',
      title: 'Simulating Loading',
      message: `Loading state active for ${duration}ms`,
      duration: duration,
    });
    
    setTimeout(() => {
      setLoading(false);
      showToast({
        type: 'info',
        title: 'Loading Complete',
        message: 'Simulated loading state finished',
        duration: 3000,
      });
    }, duration);
  }
}; 