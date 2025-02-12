import { showToast } from '@/components/ToastHost';
import { ErrorCode, ErrorMessageMap } from '@/lib/errors/types';

export const NOTIFICATION_MESSAGES = {
  // Auth & Verification
  EMAIL_VERIFICATION_SENT: 'Verification code sent to your email',
  EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully',
  EMAIL_VERIFICATION_FAILED: 'Failed to verify email',
  EMAIL_VERIFICATION_INVALID: 'Invalid verification code',
  EMAIL_VERIFICATION_RATE_LIMIT: 'Too many attempts. Please try again later',
  EMAIL_VERIFICATION_EXPIRED: 'Verification code expired',
  
  // Profile
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  PROFILE_UPDATE_FAILED: 'Failed to update profile',
  
  // General
  UNKNOWN_ERROR: 'An unexpected error occurred',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',
  UNAUTHORIZED: 'You are not authorized to perform this action',
} as const;

export type NotificationMessage = keyof typeof NOTIFICATION_MESSAGES;

interface NotifyOptions {
  duration?: number;
  error?: Error | null;
  details?: string;
}

export const NotificationService = {
  success: (message: NotificationMessage | string, _options: NotifyOptions = {}) => {
    const text = NOTIFICATION_MESSAGES[message as NotificationMessage] || message;
    showToast.success(text);
  },

  error: (message: NotificationMessage | string | ErrorCode, options: NotifyOptions = {}) => {
    let text = message;
    
    // Handle ErrorCode enum
    if (Object.values(ErrorCode).includes(message as ErrorCode)) {
      text = ErrorMessageMap[message as ErrorCode];
    }
    // Handle predefined messages
    else if (NOTIFICATION_MESSAGES[message as NotificationMessage]) {
      text = NOTIFICATION_MESSAGES[message as NotificationMessage];
    }
    
    // Add error details if available
    if (options.error?.message || options.details) {
      text = `${text}: ${options.error?.message || options.details}`;
    }

    showToast.error(text as string);
    
    // Log error in development
    if (process.env.NODE_ENV === 'development' && options.error) {
      console.error('Error:', options.error);
    }
  },

  info: (message: NotificationMessage | string, _options: NotifyOptions = {}) => {
    const text = NOTIFICATION_MESSAGES[message as NotificationMessage] || message;
    showToast.info(text);
  },

  warning: (message: NotificationMessage | string, _options: NotifyOptions = {}) => {
    const text = NOTIFICATION_MESSAGES[message as NotificationMessage] || message;
    showToast.warning(text);
  },
}; 