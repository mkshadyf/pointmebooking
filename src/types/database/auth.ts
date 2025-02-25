import { Database } from '@generated.types';
import { Session, User } from '@supabase/supabase-js';

// Base profile type from database
export type DbProfile = Database['public']['Tables']['profiles']['Row'];

// Auth role type
export type AuthRole = Database['public']['Enums']['user_role'];
export type UserStatus = Database['public']['Enums']['user_status'];

// Auth error types
export interface AuthError extends Error {
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
}

// Email template types
export interface EmailTemplate {
    subject: string;
    body: string;
    data: Record<string, unknown>;
}

// Enhanced profile interface with all properties from database
export interface AuthProfile extends DbProfile {
    // Additional auth-specific fields not in database
    is_verified?: boolean;
    is_email_verified?: boolean;
    last_login?: string | null;
    login_count?: number;
    failed_login_attempts?: number;
    last_failed_login?: string | null;
    password_reset_token?: string | null;
    password_reset_expires?: string | null;
}

// Login credentials interface
export interface LoginCredentials {
    email: string;
    password: string;
}

// Auth result interface
export interface AuthResult {
    user: AuthProfile;
    session: Session | null;
    supabaseUser: User;
}

// Auth response type
export interface AuthResponse<T> {
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
    user: User | null;
    profile: AuthProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: AuthError | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, role: AuthRole) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
    verifyEmail: (code: string) => Promise<void>;
    resendVerification: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    refreshSession: () => Promise<void>;
}

// Auth verification constants
export const AUTH_CONSTANTS = {
    MAX_VERIFICATION_ATTEMPTS: 5,
    VERIFICATION_TIMEOUT_MINUTES: 30,
    PASSWORD_RESET_EXPIRY_HOURS: 24,
    MIN_PASSWORD_LENGTH: 8,
    SESSION_EXPIRY_DAYS: 7,
} as const; 