
// Base error interface
export interface BaseError {
  code: string;
  message: string;
  status: number;
  context?: Record<string, any>;
}

// Error codes enum
export enum ErrorCode {
  // Auth Errors
  AUTH_INVALID_CREDENTIALS = 'auth/invalid-credentials',
  AUTH_EMAIL_NOT_VERIFIED = 'auth/email-not-verified',
  AUTH_SESSION_EXPIRED = 'auth/session-expired',
  AUTH_INVALID_TOKEN = 'auth/invalid-token',
  AUTH_MISSING_PROFILE = 'auth/missing-profile',
  AUTH_UNAUTHORIZED = 'auth/unauthorized',
  AUTH_INVALID_ROLE = 'auth/invalid-role',
  AUTH_OAUTH_ERROR = 'auth/oauth-error',

  // Profile Errors
  PROFILE_NOT_FOUND = 'profile/not-found',
  PROFILE_UPDATE_FAILED = 'profile/update-failed',
  PROFILE_INVALID_DATA = 'profile/invalid-data',
  PROFILE_CREATION_FAILED = 'profile/creation-failed',

  // Business Errors
  BUSINESS_NOT_FOUND = 'business/not-found',
  BUSINESS_UPDATE_FAILED = 'business/update-failed',
  BUSINESS_INVALID_DATA = 'business/invalid-data',
  BUSINESS_SERVICE_NOT_FOUND = 'business/service-not-found',

  // Service Errors
  SERVICE_NOT_FOUND = 'service/not-found',
  SERVICE_UPDATE_FAILED = 'service/update-failed',
  SERVICE_INVALID_DATA = 'service/invalid-data',
  SERVICE_CREATION_FAILED = 'service/creation-failed',

  // Booking Errors
  BOOKING_NOT_FOUND = 'booking/not-found',
  BOOKING_UPDATE_FAILED = 'booking/update-failed',
  BOOKING_INVALID_DATA = 'booking/invalid-data',
  BOOKING_SLOT_UNAVAILABLE = 'booking/slot-unavailable',
  BOOKING_CREATION_FAILED = 'booking/creation-failed',

  // Validation Errors
  VALIDATION_ERROR = 'validation/error',
  VALIDATION_REQUIRED = 'validation/required',
  VALIDATION_INVALID_FORMAT = 'validation/invalid-format',

  // API Errors
  API_RATE_LIMIT = 'api/rate-limit',
  API_INTERNAL_ERROR = 'api/internal-error',
  API_BAD_REQUEST = 'api/bad-request',
  API_NOT_FOUND = 'api/not-found',

  // Storage Errors
  STORAGE_UPLOAD_FAILED = 'storage/upload-failed',
  STORAGE_DELETE_FAILED = 'storage/delete-failed',
  STORAGE_FILE_NOT_FOUND = 'storage/file-not-found',
  STORAGE_INVALID_FILE = 'storage/invalid-file',

  // Database Errors
  DB_CONNECTION_ERROR = 'db/connection-error',
  DB_QUERY_FAILED = 'db/query-failed',
  DB_RECORD_NOT_FOUND = 'db/record-not-found',
  DB_DUPLICATE_ENTRY = 'db/duplicate-entry',

  // Generic Errors
  UNKNOWN_ERROR = 'error/unknown',
  NETWORK_ERROR = 'error/network',
  REQUEST_FAILED = 'error/request-failed',
  NOT_IMPLEMENTED = 'error/not-implemented'
}

// HTTP status codes mapping
export const ErrorStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 403,
  [ErrorCode.AUTH_SESSION_EXPIRED]: 401,
  [ErrorCode.AUTH_INVALID_TOKEN]: 401,
  [ErrorCode.AUTH_MISSING_PROFILE]: 404,
  [ErrorCode.AUTH_UNAUTHORIZED]: 403,
  [ErrorCode.AUTH_INVALID_ROLE]: 403,
  [ErrorCode.AUTH_OAUTH_ERROR]: 400,
  [ErrorCode.PROFILE_NOT_FOUND]: 404,
  [ErrorCode.PROFILE_UPDATE_FAILED]: 500,
  [ErrorCode.PROFILE_INVALID_DATA]: 400,
  [ErrorCode.PROFILE_CREATION_FAILED]: 500,
  [ErrorCode.BUSINESS_NOT_FOUND]: 404,
  [ErrorCode.BUSINESS_UPDATE_FAILED]: 500,
  [ErrorCode.BUSINESS_INVALID_DATA]: 400,
  [ErrorCode.BUSINESS_SERVICE_NOT_FOUND]: 404,
  [ErrorCode.SERVICE_NOT_FOUND]: 404,
  [ErrorCode.SERVICE_UPDATE_FAILED]: 500,
  [ErrorCode.SERVICE_INVALID_DATA]: 400,
  [ErrorCode.SERVICE_CREATION_FAILED]: 500,
  [ErrorCode.BOOKING_NOT_FOUND]: 404,
  [ErrorCode.BOOKING_UPDATE_FAILED]: 500,
  [ErrorCode.BOOKING_INVALID_DATA]: 400,
  [ErrorCode.BOOKING_SLOT_UNAVAILABLE]: 409,
  [ErrorCode.BOOKING_CREATION_FAILED]: 500,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.VALIDATION_REQUIRED]: 400,
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 400,
  [ErrorCode.API_RATE_LIMIT]: 429,
  [ErrorCode.API_INTERNAL_ERROR]: 500,
  [ErrorCode.API_BAD_REQUEST]: 400,
  [ErrorCode.API_NOT_FOUND]: 404,
  [ErrorCode.STORAGE_UPLOAD_FAILED]: 500,
  [ErrorCode.STORAGE_DELETE_FAILED]: 500,
  [ErrorCode.STORAGE_FILE_NOT_FOUND]: 404,
  [ErrorCode.STORAGE_INVALID_FILE]: 400,
  [ErrorCode.DB_CONNECTION_ERROR]: 503,
  [ErrorCode.DB_QUERY_FAILED]: 500,
  [ErrorCode.DB_RECORD_NOT_FOUND]: 404,
  [ErrorCode.DB_DUPLICATE_ENTRY]: 409,
  [ErrorCode.UNKNOWN_ERROR]: 500,
  [ErrorCode.NETWORK_ERROR]: 503,
  [ErrorCode.REQUEST_FAILED]: 500,
  [ErrorCode.NOT_IMPLEMENTED]: 501,
};

// Error messages mapping
export const ErrorMessageMap: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired, please sign in again',
  [ErrorCode.AUTH_INVALID_TOKEN]: 'Invalid or expired token',
  [ErrorCode.AUTH_MISSING_PROFILE]: 'User profile not found',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action',
  [ErrorCode.AUTH_INVALID_ROLE]: 'Invalid user role',
  [ErrorCode.AUTH_OAUTH_ERROR]: 'OAuth authentication failed',
  [ErrorCode.PROFILE_NOT_FOUND]: 'Profile not found',
  [ErrorCode.PROFILE_UPDATE_FAILED]: 'Failed to update profile',
  [ErrorCode.PROFILE_INVALID_DATA]: 'Invalid profile data',
  [ErrorCode.PROFILE_CREATION_FAILED]: 'Failed to create profile',
  [ErrorCode.BUSINESS_NOT_FOUND]: 'Business not found',
  [ErrorCode.BUSINESS_UPDATE_FAILED]: 'Failed to update business',
  [ErrorCode.BUSINESS_INVALID_DATA]: 'Invalid business data',
  [ErrorCode.BUSINESS_SERVICE_NOT_FOUND]: 'Business service not found',
  [ErrorCode.SERVICE_NOT_FOUND]: 'Service not found',
  [ErrorCode.SERVICE_UPDATE_FAILED]: 'Failed to update service',
  [ErrorCode.SERVICE_INVALID_DATA]: 'Invalid service data',
  [ErrorCode.SERVICE_CREATION_FAILED]: 'Failed to create service',
  [ErrorCode.BOOKING_NOT_FOUND]: 'Booking not found',
  [ErrorCode.BOOKING_UPDATE_FAILED]: 'Failed to update booking',
  [ErrorCode.BOOKING_INVALID_DATA]: 'Invalid booking data',
  [ErrorCode.BOOKING_SLOT_UNAVAILABLE]: 'Selected time slot is not available',
  [ErrorCode.BOOKING_CREATION_FAILED]: 'Failed to create booking',
  [ErrorCode.VALIDATION_ERROR]: 'Validation error',
  [ErrorCode.VALIDATION_REQUIRED]: 'Required field missing',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid data format',
  [ErrorCode.API_RATE_LIMIT]: 'Too many requests, please try again later',
  [ErrorCode.API_INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.API_BAD_REQUEST]: 'Bad request',
  [ErrorCode.API_NOT_FOUND]: 'Resource not found',
  [ErrorCode.STORAGE_UPLOAD_FAILED]: 'Failed to upload file',
  [ErrorCode.STORAGE_DELETE_FAILED]: 'Failed to delete file',
  [ErrorCode.STORAGE_FILE_NOT_FOUND]: 'File not found',
  [ErrorCode.STORAGE_INVALID_FILE]: 'Invalid file format or size',
  [ErrorCode.DB_CONNECTION_ERROR]: 'Database connection error',
  [ErrorCode.DB_QUERY_FAILED]: 'Database query failed',
  [ErrorCode.DB_RECORD_NOT_FOUND]: 'Record not found',
  [ErrorCode.DB_DUPLICATE_ENTRY]: 'Record already exists',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred',
  [ErrorCode.NETWORK_ERROR]: 'Network error',
  [ErrorCode.REQUEST_FAILED]: 'Request failed',
  [ErrorCode.NOT_IMPLEMENTED]: 'Feature not implemented',
}; 