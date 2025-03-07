import { convertToAuthError } from '@/lib/error/auth-error-utils';
import { AuthProfile, AuthResponse, AuthResult, AuthRole, DbProfile } from '@/types/database/auth';
import { Session, User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '../client';
import { BaseServiceUtils } from './BaseService';

// Initialize the client lazily to avoid issues in SSR
let supabaseClientInstance: Awaited<ReturnType<typeof createServerSupabaseClient>> | null = null;

/**
 * Gets the Supabase client instance, creating it if necessary
 */
const getSupabaseClient = async () => {
  if (!supabaseClientInstance) {
    // Provide a dummy cookie container that satisfies the type requirements
    supabaseClientInstance = await createServerSupabaseClient({
      get: () => '',
      set: () => {},
      delete: () => {}
    } as any);
  }
  return supabaseClientInstance;
};

/**
 * Helper function to convert DbProfile to AuthProfile
 * Maps database profile fields to auth profile fields with proper types
 */
export const createAuthProfile = (profile: DbProfile): AuthProfile => {
  // Destructure to handle null values properly
  const { 
    email_verified, 
    avatar_url, 
    cover_image_url, 
    onboarding_completed,
    created_at,
    updated_at,
    role,
    full_name,
    ...rest 
  } = profile;

  return {
    ...rest,
    is_verified: Boolean(email_verified),
    is_email_verified: Boolean(email_verified),
    avatar_url: avatar_url || undefined,
    cover_image_url: cover_image_url || undefined,
    onboarding_completed: onboarding_completed || false,
    created_at: created_at || new Date().toISOString(),
    updated_at: updated_at || new Date().toISOString(),
    email_verified: Boolean(email_verified),
    role: role as AuthRole,
    user_id: profile.id,
    full_name: full_name || '',
    last_login: null,
    login_count: 0,
    failed_login_attempts: 0,
    last_failed_login: null,
    password_reset_token: null,
    password_reset_expires: null
  };
};

/**
 * Service class for authentication operations
 * Handles user authentication, registration, and profile management
 * Implements the singleton pattern for consistent instance usage
 */
export class AuthService extends BaseServiceUtils {
    private static instance: AuthService;

    private constructor() {
        super();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Login a user with email and password
     */
    async login(credentials: { email: string; password: string }): Promise<AuthResponse<AuthResult>> {
        const { email, password } = credentials;
        
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) throw new Error('Failed to initialize Supabase client');
            
            // Attempt to sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            if (!data?.user) throw new Error('No user returned from authentication');
            
            // Get user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id as any)
                .single();
                
            if (profileError) throw profileError;
            if (!profile) throw new Error('No profile found for user');
            
            // Convert profile to auth profile
            const authProfile = createAuthProfile(profile as unknown as DbProfile);
            
            return {
                data: {
                    user: authProfile,
                    session: data.session,
                    supabaseUser: data.user
                },
                error: null
            };
        } catch (error) {
            console.error('Login error:', error);
            
            return {
                data: null,
                error: convertToAuthError(error)
            };
        }
    }
    
    /**
     * Register a new user
     */
    async register(email: string, password: string, role: AuthRole): Promise<AuthResponse<AuthResult>> {
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) throw new Error('Failed to initialize Supabase client');
            
            // Create user account
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/verify-email`,
                    data: {
                        role
                    }
                }
            });
            
            if (error) throw error;
            if (!data?.user) throw new Error('No user returned from registration');
            
            // Create user profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email,
                    role,
                    email_verified: false,
                    onboarding_completed: false,
                    status: 'active',
                    full_name: ''
                } as any);
                
            if (profileError) throw profileError;
            
            // Get the created profile
            const { data: profile, error: getProfileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id as any)
                .single();
                
            if (getProfileError) throw getProfileError;
            if (!profile) throw new Error('No profile found for new user');
            
            // Convert to auth profile
            const authProfile = createAuthProfile(profile as unknown as DbProfile);
            
            return {
                data: {
                    user: authProfile,
                    session: data.session,
                    supabaseUser: data.user
                },
                error: null
            };
        } catch (error) {
            console.error('Registration error:', error);
            
            return {
                data: null,
                error: convertToAuthError(error)
            };
        }
    }
    
    /**
     * Log out the current user
     */
    async logout(): Promise<AuthResponse<boolean>> {
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) throw new Error('Failed to initialize Supabase client');
            
            const { error } = await supabase.auth.signOut();
            
            if (error) throw error;
            
            return {
                data: true,
                error: null
            };
        } catch (error) {
            console.error('Logout error:', error);
            
            return {
                data: null,
                error: convertToAuthError(error)
            };
        }
    }
    
    /**
     * Get the current user
     */
    async getUser(): Promise<AuthResponse<User | null>> {
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) throw new Error('Failed to initialize Supabase client');
            
            const { data, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            
            return {
                data: data?.user || null,
                error: null
            };
        } catch (error) {
            console.error('Get user error:', error);
            
            return {
                data: null,
                error: convertToAuthError(error)
            };
        }
    }
    
    /**
     * Get the current user's profile
     */
    async getProfile(): Promise<AuthResponse<AuthProfile | null>> {
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) throw new Error('Failed to initialize Supabase client');
            
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) throw userError;
            if (!userData?.user) return { data: null, error: null };
            
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userData.user.id as any)
                .single();
                
            if (profileError) throw profileError;
            
            return {
                data: createAuthProfile(profile as unknown as DbProfile),
                error: null
            };
        } catch (error) {
            console.error('Get profile error:', error);
            
            return {
                data: null,
                error: convertToAuthError(error)
            };
        }
    }
    
    /**
     * Get the current session
     */
    async getSession(): Promise<AuthResponse<Session | null>> {
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) throw new Error('Failed to initialize Supabase client');
            
            const { data, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            return {
                data: data?.session || null,
                error: null
            };
        } catch (error) {
            console.error('Get session error:', error);
            
            return {
                data: null,
                error: convertToAuthError(error)
            };
        }
    }
    
    /**
     * Send a password reset email
     */
    async resetPassword(email: string): Promise<AuthResponse<boolean>> {
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) throw new Error('Failed to initialize Supabase client');
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            
            if (error) throw error;
            
            return {
                data: true,
                error: null
            };
        } catch (error) {
            console.error('Reset password error:', error);
            
            return {
                data: null,
                error: convertToAuthError(error)
            };
        }
    }
    
    /**
     * Update the user's password
     */
    async updatePassword(password: string): Promise<AuthResponse<boolean>> {
        try {
            const supabase = await getSupabaseClient();
            if (!supabase) throw new Error('Failed to initialize Supabase client');
            
            const { error } = await supabase.auth.updateUser({
                password,
            });
            
            if (error) throw error;
            
            return {
                data: true,
                error: null
            };
        } catch (error) {
            console.error('Update password error:', error);
            
            return {
                data: null,
                error: convertToAuthError(error)
            };
        }
    }
}

// Export the singleton instance
export const authService = AuthService.getInstance();

/**
 * Static wrapper for backward compatibility
 * Delegates to the singleton instance
 */
export class AuthServiceStatic {
    /**
     * Login a user with email and password
     */
    static async login(credentials: { email: string; password: string }): Promise<AuthResponse<AuthResult>> {
        return authService.login(credentials);
    }
    
    /**
     * Register a new user
     */
    static async register(email: string, password: string, role: AuthRole): Promise<AuthResponse<AuthResult>> {
        return authService.register(email, password, role);
    }
    
    /**
     * Log out the current user
     */
    static async logout(): Promise<AuthResponse<boolean>> {
        return authService.logout();
    }
    
    /**
     * Get the current user
     */
    static async getUser(): Promise<AuthResponse<User | null>> {
        return authService.getUser();
    }
    
    /**
     * Get the current user's profile
     */
    static async getProfile(): Promise<AuthResponse<AuthProfile | null>> {
        return authService.getProfile();
    }
    
    /**
     * Get the current session
     */
    static async getSession(): Promise<AuthResponse<Session | null>> {
        return authService.getSession();
    }
    
    /**
     * Send a password reset email
     */
    static async resetPassword(email: string): Promise<AuthResponse<boolean>> {
        return authService.resetPassword(email);
    }
    
    /**
     * Update the user's password
     */
    static async updatePassword(password: string): Promise<AuthResponse<boolean>> {
        return authService.updatePassword(password);
    }
} 