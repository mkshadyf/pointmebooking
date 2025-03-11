/**
 * Core Services
 * 
 * This module provides centralized services for common operations:
 * - Error handling
 * - Toast notifications
 * - Authentication
 */

// Core services
export * from './auth';
export * from './error';
export * from './toast';
export { compat };

// Compatibility layer (deprecated)
import * as compat from './compat';
