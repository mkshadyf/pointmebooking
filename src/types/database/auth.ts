import { DbProfile } from '@/lib/supabase/types';
import { User } from '@supabase/supabase-js';

// Base profile type from database
// export type DbProfile = Database['public']['Tables']['profiles']['Row']; // No longer needed, use the imported one

// Auth role type
export type AuthRole = 'admin' | 'business' | 'customer';

// Enhanced profile interface with all properties
export interface AuthProfile extends Omit<DbProfile, 'email'> {
    id: string;
    email: string;
    role: AuthRole;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    is_email_verified: boolean;
    email_verified: boolean | null;
    verification_attempts: number;
    verification_code: string | null;
    onboarding_completed: boolean;
    working_hours: Record<string, any>;
    preferences: Record<string, any>;
    social_media: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// Auth context interface
export interface AuthContextType {
    user: User | null;
    profile: AuthProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, role: AuthRole) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
}

// Auth state interface
export interface AuthState {
    user: AuthProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    initialized: boolean;
    setUser: (user: AuthProfile | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
} 