// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    SETTINGS: '/api/users/settings',
  },
  SERVICES: {
    LIST: '/api/services',
    DETAILS: (id: string) => `/api/services/${id}`,
    CREATE: '/api/services',
    UPDATE: (id: string) => `/api/services/${id}`,
    DELETE: (id: string) => `/api/services/${id}`,
  },
  BUSINESSES: {
    LIST: '/api/businesses',
    DETAILS: (id: string) => `/api/businesses/${id}`,
    CREATE: '/api/businesses',
    UPDATE: (id: string) => `/api/businesses/${id}`,
    DELETE: (id: string) => `/api/businesses/${id}`,
  },
};

// API Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// API Headers
export const API_HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
  },
  MULTIPART: {
    'Content-Type': 'multipart/form-data',
  },
};

// API Error Messages
export const API_ERRORS = {
  NETWORK: 'Network error occurred. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER: 'Server error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  DEFAULT: 'An unexpected error occurred.',
}; 