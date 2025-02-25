import { AuthError, AuthProfile } from '@/types/database/auth';
import { User } from '@supabase/supabase-js';

export interface SupabaseState {
    user: User | null;
    profile: AuthProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: AuthError | null;
    initialized: boolean;
}

export interface SupabaseActions {
    setUser: (user: User | null) => void;
    setProfile: (profile: AuthProfile | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: AuthError | null) => void;
    clearError: () => void;
}

export interface SupabaseStore extends SupabaseState, SupabaseActions {}
