import { UserProfile, UserRole } from '@/types';
import { Database } from '@generated.types';
import { Session, User } from '@supabase/supabase-js';

// Base profile type from database
export type DbProfile = Database['public']['Tables']['profiles']['Row'];

// Auth role type - using UserRole from types/index.ts
export type AuthRole = UserRole;

// Auth error types
export interface AuthError extends Error {
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
    __isAuthError?: boolean;
}

// Email template types
export interface EmailTemplate {
    subject: string;
    body: string;
    data: Record<string, unknown>;
}

/**
 * Enhanced profile interface with security-related fields
 * Extends UserProfile from types/index.ts to ensure consistency
 */
export interface AuthProfile extends UserProfile {
    // Additional auth-specific fields not in database
    is_verified: boolean;
    is_email_verified: boolean;
    last_login: string | null;
    login_count: number;
    failed_login_attempts: number;
    last_failed_login: string | null;
    password_reset_token: string | null;
    password_reset_expires: string | null;
}

// Login credentials interface
export interface LoginCredentials {
    email: string;
    password: string;
}

// Auth result interface
export interface AuthResult {
    user: AuthProfile | null;
    session: Session | null;
    supabaseUser?: User | null;
    requires2FA?: boolean;
}

// Updated AuthResponse to be generic
export interface AuthResponse<T = any> {
    data: T | null;
    error: AuthError | null;
}

// Auth state interface
export interface AuthState {
    user: User | null;
    profile: AuthProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: AuthError | null;
    initialized: boolean;
}

// Auth context interface
export interface AuthContextType {
    // User data
    user: User | null;
    profile: AuthProfile | null;
    session?: Session | null;
    
    // Auth state
    isLoading: boolean;
    isAuthenticated: boolean;
    error: AuthError | null;
    
    // Auth actions
    login: (email: string, password: string) => Promise<AuthResponse<AuthResult>>;
    register: (email: string, password: string, role: AuthRole) => Promise<AuthResponse<AuthResult>>;
    signOut: () => Promise<AuthResponse<void>>;
    updateProfile: (data: Partial<AuthProfile>) => Promise<AuthResponse<AuthProfile>>;
    verifyEmail: (code: string) => Promise<AuthResponse<void>>;
    resendVerification: () => Promise<AuthResponse<void>>;
    resetPassword: (email: string) => Promise<AuthResponse<void>>;
    updatePassword: (newPassword: string) => Promise<AuthResponse<void>>;
    refreshSession: () => Promise<AuthResponse<AuthResult>>;
}

// Auth verification constants
export const AUTH_CONSTANTS = {
    MAX_VERIFICATION_ATTEMPTS: 5,
    VERIFICATION_TIMEOUT_MINUTES: 30,
    PASSWORD_RESET_EXPIRY_HOURS: 24,
    MIN_PASSWORD_LENGTH: 8,
    SESSION_EXPIRY_DAYS: 7,
} as const; 