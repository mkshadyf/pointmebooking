export * from './api';
export * from './routes';
export * from './ui';

// Global app constants
export const APP_NAME = 'PointMe';
export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_TIMEZONE = 'UTC';

// Authentication related
export const AUTH_COOKIE_NAME = 'auth_token';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// API related
export const API_VERSION = 'v1';
export const API_TIMEOUT = 30000; // 30 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Cache
export const CACHE_TTL = 60 * 60; // 1 hour 