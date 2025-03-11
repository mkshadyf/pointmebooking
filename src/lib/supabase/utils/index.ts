// Error handling
// The errors directory has been consolidated into the error module
// export * from './errors';

// Import and re-export ErrorMessageMap from the error module
import { ErrorCode } from '@/lib/core/compat/error-compat';

// Define ErrorMessageMap for backward compatibility
export const ErrorMessageMap: Record<string, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.AUTH_EMAIL_IN_USE]: 'Email is already in use',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Password is too weak',
  [ErrorCode.AUTH_INVALID_EMAIL]: 'Invalid email format',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'User not found',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action',
  [ErrorCode.AUTH_ERROR]: 'Authentication error',
  [ErrorCode.AUTH_INVALID_TOKEN]: 'Invalid or expired token',
  [ErrorCode.AUTH_OAUTH_ERROR]: 'OAuth authentication error',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired, please sign in again',
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address',

  [ErrorCode.PROFILE_NOT_FOUND]: 'Profile not found',
  [ErrorCode.PROFILE_UPDATE_FAILED]: 'Failed to update profile',
  [ErrorCode.PROFILE_ERROR]: 'Profile error',
  [ErrorCode.PROFILE_CREATION_FAILED]: 'Failed to create profile',

  [ErrorCode.SERVICE_NOT_FOUND]: 'Service not found',
  [ErrorCode.SERVICE_CREATE_FAILED]: 'Failed to create service',
  [ErrorCode.SERVICE_UPDATE_FAILED]: 'Failed to update service',
  [ErrorCode.SERVICE_ERROR]: 'Service error',

  [ErrorCode.BOOKING_NOT_FOUND]: 'Booking not found',
  [ErrorCode.BOOKING_CREATE_FAILED]: 'Failed to create booking',
  [ErrorCode.BOOKING_SLOT_UNAVAILABLE]: 'This time slot is no longer available',
  [ErrorCode.BOOKING_ERROR]: 'Booking error',

  [ErrorCode.API_ERROR]: 'API error',
  [ErrorCode.API_TIMEOUT]: 'Request timed out',
  [ErrorCode.API_RATE_LIMIT]: 'Too many requests, please try again later',
  [ErrorCode.API_BAD_REQUEST]: 'Bad request',
  [ErrorCode.VALIDATION_REQUIRED]: 'Required field missing',
  [ErrorCode.VALIDATION_ERROR]: 'Validation error',

  [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
  
  // Add the general error codes for completeness
  [ErrorCode.AUTHENTICATION_ERROR]: 'Authentication error',
  [ErrorCode.AUTHORIZATION_ERROR]: 'Authorization error',
  [ErrorCode.NOT_FOUND_ERROR]: 'Resource not found',
  [ErrorCode.CONFLICT_ERROR]: 'Conflict error',
  [ErrorCode.EXTERNAL_ERROR]: 'External service error',
  [ErrorCode.DATABASE_ERROR]: 'Database error',
  [ErrorCode.NETWORK_ERROR]: 'Network error',
  [ErrorCode.RATE_LIMIT_ERROR]: 'Rate limit exceeded',
  [ErrorCode.UNEXPECTED_ERROR]: 'Unexpected error',
  [ErrorCode.INPUT_ERROR]: 'Input error',
  [ErrorCode.RESOURCE_ERROR]: 'Resource error',
  [ErrorCode.SERVER_ERROR]: 'Server error',
  [ErrorCode.BUSINESS_LOGIC_ERROR]: 'Business logic error'
};

// Validation
export * from './validators';

// Re-export common utils
export {
    formatCurrency, formatDate,
    formatTime, getCookie, isValidEmail,
    isValidPassword,
    isValidPhone,
    isValidUrl, setCookie, truncateText
} from '../../utils';
