/**
 * Auth module index
 * Exports all auth-related functionality
 */

// Export context and provider
export * from './context';

// Export guards
export * from './guards';

/**
 * Authentication module
 * 
 * This is the centralized export point for all authentication-related components.
 * It re-exports types, hooks, contexts, and utilities to provide a single import
 * point for authentication functionality throughout the application.
 * 
 * Usage:
 * import { useAuth, AuthProfile } from '@/lib/auth';
 * 
 * const { user, isAuthenticated, login, logout } = useAuth();
 */

// Re-export auth types
export type {
    AuthError, AuthProfile, AuthResponse,
    AuthResult,
    AuthState,
    EmailTemplate,
    LoginCredentials
} from '@/types/auth';

// Re-export auth hooks
export {
    useAuth
} from '@/hooks/auth';

// Re-export auth context
export {
    AuthProvider
} from '@/lib/supabase/auth/context/AuthContext';

// Re-export auth utils
export {
    convertToAuthError,
    toAuthError
} from '@/lib/error/auth-error-converter';

// Re-export auth service
export {
    AuthService
} from '@/lib/supabase/services/auth/auth.service';

// Re-export auth store
export {
    useAuthStore
} from '@/lib/supabase/store/auth.store';

