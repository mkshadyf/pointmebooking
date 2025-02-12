// Error codes
export enum ErrorCode {
  // Auth errors
  AUTH_INVALID_CREDENTIALS = 'auth/invalid-credentials',
  AUTH_EMAIL_IN_USE = 'auth/email-already-in-use',
  AUTH_WEAK_PASSWORD = 'auth/weak-password',
  AUTH_INVALID_EMAIL = 'auth/invalid-email',
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_UNAUTHORIZED = 'auth/unauthorized',
  AUTH_ERROR = 'auth/error',
  AUTH_INVALID_TOKEN = 'auth/invalid-token',
  AUTH_OAUTH_ERROR = 'auth/oauth-error',
  AUTH_SESSION_EXPIRED = 'auth/session-expired',
  AUTH_EMAIL_NOT_VERIFIED = 'auth/email-not-verified',

  // Profile errors
  PROFILE_NOT_FOUND = 'profile/not-found',
  PROFILE_UPDATE_FAILED = 'profile/update-failed',
  PROFILE_ERROR = 'profile/error',
  PROFILE_CREATION_FAILED = 'profile/creation-failed',

  // Service errors
  SERVICE_NOT_FOUND = 'service/not-found',
  SERVICE_CREATE_FAILED = 'service/create-failed',
  SERVICE_UPDATE_FAILED = 'service/update-failed',
  SERVICE_ERROR = 'service/error',

  // Booking errors
  BOOKING_NOT_FOUND = 'booking/not-found',
  BOOKING_CREATE_FAILED = 'booking/create-failed',
  BOOKING_SLOT_UNAVAILABLE = 'booking/slot-unavailable',
  BOOKING_ERROR = 'booking/error',

  // API errors
  API_ERROR = 'api/error',
  API_TIMEOUT = 'api/timeout',
  API_RATE_LIMIT = 'api/rate-limit',
  API_BAD_REQUEST = 'api/bad-request',
  VALIDATION_REQUIRED = 'api/validation-required',
  VALIDATION_ERROR = 'api/validation-error',

  // General errors
  UNKNOWN_ERROR = 'general/unknown',
}

// Error messages
export const ErrorMessageMap: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.AUTH_EMAIL_IN_USE]: 'Email is already in use',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Password is too weak',
  [ErrorCode.AUTH_INVALID_EMAIL]: 'Invalid email address',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'User not found',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.AUTH_ERROR]: 'Authentication error occurred',
  [ErrorCode.AUTH_INVALID_TOKEN]: 'Invalid authentication token',
  [ErrorCode.AUTH_OAUTH_ERROR]: 'OAuth authentication failed',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired',
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address',

  [ErrorCode.PROFILE_NOT_FOUND]: 'Profile not found',
  [ErrorCode.PROFILE_UPDATE_FAILED]: 'Failed to update profile',
  [ErrorCode.PROFILE_ERROR]: 'Profile error occurred',
  [ErrorCode.PROFILE_CREATION_FAILED]: 'Failed to create profile',

  [ErrorCode.SERVICE_NOT_FOUND]: 'Service not found',
  [ErrorCode.SERVICE_CREATE_FAILED]: 'Failed to create service',
  [ErrorCode.SERVICE_UPDATE_FAILED]: 'Failed to update service',
  [ErrorCode.SERVICE_ERROR]: 'Service error occurred',

  [ErrorCode.BOOKING_NOT_FOUND]: 'Booking not found',
  [ErrorCode.BOOKING_CREATE_FAILED]: 'Failed to create booking',
  [ErrorCode.BOOKING_SLOT_UNAVAILABLE]: 'Selected time slot is not available',
  [ErrorCode.BOOKING_ERROR]: 'Booking error occurred',

  [ErrorCode.API_ERROR]: 'An error occurred',
  [ErrorCode.API_TIMEOUT]: 'Request timed out',
  [ErrorCode.API_RATE_LIMIT]: 'Too many requests',
  [ErrorCode.API_BAD_REQUEST]: 'Invalid request',
  [ErrorCode.VALIDATION_REQUIRED]: 'Validation failed: Required fields missing',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',

  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred',
};

// Base error class
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string
  ) {
    super(message || ErrorMessageMap[code]);
    this.name = 'AppError';
  }
}

// Error handlers
export function handleAuthError(error: any): AppError {
  if (error?.message?.includes('Invalid login credentials')) {
    return new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS);
  }
  if (error?.message?.includes('User not found')) {
    return new AppError(ErrorCode.AUTH_USER_NOT_FOUND);
  }
  if (error?.message?.includes('Email already in use')) {
    return new AppError(ErrorCode.AUTH_EMAIL_IN_USE);
  }
  return new AppError(ErrorCode.AUTH_ERROR, error?.message);
}

export function handleApiError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }
  if (error?.code) {
    return new AppError(error.code as ErrorCode, error.message);
  }
  return new AppError(ErrorCode.API_ERROR, error?.message);
}

export function handleError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError(ErrorCode.API_ERROR, error?.message);
} 