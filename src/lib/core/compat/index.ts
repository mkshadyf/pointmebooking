/**
 * Compatibility Layer
 * 
 * This module provides backward compatibility with the old error handling,
 * toast notifications, and authentication feedback systems to ease the
 * transition to the new centralized core services.
 * 
 * @deprecated These exports are provided for backward compatibility only.
 * Please migrate to the new core services directly.
 */

// Auth compatibility
export * from './auth-compat';

// Error compatibility
export * from './error-compat';

// Toast compatibility
export * from './toast-compat';
