import { convertToAuthError } from '@/lib/error/auth-error-utils';
import { AuthProfile, AuthResponse, DbProfile } from '@/types/database/auth';
import { Session } from '@supabase/supabase-js';
import { BaseServiceUtils } from '../BaseService';
import { supabaseClientService } from '../core/supabase-client.service';

// Define UserStatus type if it's not exported from auth types
type UserStatus = 'active' | 'suspended';
// Define AuthRole type if it's not exported from auth types
type AuthRole = 'customer' | 'business' | 'admin';

/**
 * Authentication service for handling user authentication and profile management
 * Implements the singleton pattern for consistent instance management
 */
export class AuthService extends BaseServiceUtils {
  private static instance: AuthService;
  
  private constructor() {
    super();
  }
  
  /**
   * Get the singleton instance of AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Get the current session
   * @returns The current session or null if not authenticated
   */
  public async getSession(): Promise<AuthResponse<Session | null>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client.auth.getSession();
        
        if (error) {
          return { data: null, error: convertToAuthError(error) };
        }
        
        return { data: data.session, error: null };
      } catch (error) {
        return { data: null, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Get the user profile
   * @returns The user profile or null if not found
   */
  public async getProfile(): Promise<AuthResponse<AuthProfile | null>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data: session } = await this.getSession();
        
        if (!session?.user) {
          return { data: null, error: { name: 'NotAuthenticated', message: 'User is not authenticated' } };
        }
        
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          return { data: null, error: convertToAuthError(error) };
        }
        
        const profile = data as DbProfile;
        return { data: this.createAuthProfile(profile), error: null };
      } catch (error) {
        return { data: null, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Login with email and password
   * @param params Login parameters
   * @returns The authentication result
   */
  public async login(params: { email: string; password: string }): Promise<AuthResponse<Session | null>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: params.email,
          password: params.password,
        });
        
        if (error) {
          return { data: null, error: convertToAuthError(error) };
        }
        
        return { data: data.session, error: null };
      } catch (error) {
        return { data: null, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Register a new user
   * @param params Registration parameters
   * @returns The authentication result
   */
  public async register(params: { email: string; password: string; role: string }): Promise<AuthResponse<Session | null>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              role: params.role,
            },
          },
        });
        
        if (error) {
          return { data: null, error: convertToAuthError(error) };
        }
        
        return { data: data.session, error: null };
      } catch (error) {
        return { data: null, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Logout the current user
   * @returns Success or error
   */
  public async logout(): Promise<AuthResponse<void>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { error } = await client.auth.signOut();
        
        if (error) {
          return { data: undefined, error: convertToAuthError(error) };
        }
        
        return { data: undefined, error: null };
      } catch (error) {
        return { data: undefined, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Reset password
   * @param email The email to send the reset link to
   * @returns Success or error
   */
  public async resetPassword(email: string): Promise<AuthResponse<void>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { error } = await client.auth.resetPasswordForEmail(email);
        
        if (error) {
          return { data: undefined, error: convertToAuthError(error) };
        }
        
        return { data: undefined, error: null };
      } catch (error) {
        return { data: undefined, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Update password
   * @param newPassword The new password
   * @returns Success or error
   */
  public async updatePassword(newPassword: string): Promise<AuthResponse<void>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { error } = await client.auth.updateUser({
          password: newPassword,
        });
        
        if (error) {
          return { data: undefined, error: convertToAuthError(error) };
        }
        
        return { data: undefined, error: null };
      } catch (error) {
        return { data: undefined, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Verify email
   * @param code The verification code
   * @returns Success or error
   */
  public async verifyEmail(code: string): Promise<AuthResponse<void>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { error } = await client.auth.verifyOtp({
          token_hash: code,
          type: 'email',
        });
        
        if (error) {
          return { data: undefined, error: convertToAuthError(error) };
        }
        
        return { data: undefined, error: null };
      } catch (error) {
        return { data: undefined, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Resend verification email
   * @returns Success or error
   */
  public async resendVerification(): Promise<AuthResponse<void>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data: session } = await this.getSession();
        
        if (!session?.user?.email) {
          return { data: undefined, error: { name: 'NotAuthenticated', message: 'User is not authenticated' } };
        }
        
        const { error } = await client.auth.resend({
          type: 'signup',
          email: session.user.email,
        });
        
        if (error) {
          return { data: undefined, error: convertToAuthError(error) };
        }
        
        return { data: undefined, error: null };
      } catch (error) {
        return { data: undefined, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Update user profile
   * @param data The profile data to update
   * @returns The updated profile
   */
  public async updateProfile(data: Partial<AuthProfile>): Promise<AuthResponse<AuthProfile | null>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data: session } = await this.getSession();
        
        if (!session?.user) {
          return { data: null, error: { name: 'NotAuthenticated', message: 'User is not authenticated' } };
        }
        
        const { data: updatedData, error } = await client
          .from('profiles')
          .update(data)
          .eq('id', session.user.id)
          .select('*')
          .single();
        
        if (error) {
          return { data: null, error: convertToAuthError(error) };
        }
        
        const profile = updatedData as DbProfile;
        return { data: this.createAuthProfile(profile), error: null };
      } catch (error) {
        return { data: null, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Refresh the session
   * @returns The refreshed session
   */
  public async refreshSession(): Promise<AuthResponse<Session | null>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client.auth.refreshSession();
        
        if (error) {
          return { data: null, error: convertToAuthError(error) };
        }
        
        return { data: data.session, error: null };
      } catch (error) {
        return { data: null, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Verify OTP (One-Time Password) for 2FA
   * @param params The OTP verification parameters
   * @returns The authentication result
   */
  public async verifyOTP(params: { 
    type: 'totp' | 'email' | 'sms' | 'phone', 
    code: string,
    token?: string 
  }): Promise<AuthResponse<{ session: Session | null }>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const verifyParams: any = {
          type: params.type,
          code: params.code
        };
        
        // Only add token if it's defined
        if (params.token) {
          verifyParams.token = params.token;
        }
        
        const { data, error } = await client.auth.verifyOtp(verifyParams);
        
        if (error) {
          return { data: { session: null }, error: convertToAuthError(error) };
        }
        
        return { data: { session: data.session }, error: null };
      } catch (error) {
        return { data: { session: null }, error: convertToAuthError(error) };
      }
    });
  }
  
  /**
   * Set up auth state change listener
   * @param callback The callback to call when auth state changes
   * @returns The subscription that can be used to unsubscribe
   */
  public onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabaseClientService.executeWithRetry(async (client) => {
      return client.auth.onAuthStateChange(callback);
    });
  }
  
  /**
   * Helper function to convert DbProfile to AuthProfile
   * Maps database profile fields to auth profile fields with proper types
   */
  private createAuthProfile(profile: DbProfile): AuthProfile {
    // Cast role and status to the correct types
    const userRole = profile.role as AuthRole;
    const userStatus = profile.status as UserStatus;
    
    // Create a profile with the correct types
    const authProfile = {
      // Include all base profile fields from database
      ...profile,
      
      // Override with properly typed versions
      role: userRole,
      status: userStatus,
      email_verified: Boolean(profile.email_verified),
      
      // Map user_id to match id (they're the same in our schema)
      user_id: profile.id,
      
      // Set derived fields with default values
      is_verified: Boolean(profile.email_verified),
      is_email_verified: Boolean(profile.email_verified),
      last_login: null,
      login_count: 0,
      failed_login_attempts: 0,
      last_failed_login: null,
      password_reset_token: null,
      password_reset_expires: null,
      
      // Ensure full_name is never undefined
      full_name: profile.full_name || '',
    };
    
    // Use type assertion to handle type compatibility
    return authProfile as unknown as AuthProfile;
  }
}

// Export the singleton instance
export const authService = AuthService.getInstance();

// Static wrapper for backward compatibility
export class AuthServiceStatic {
  public static async getSession(): Promise<AuthResponse<Session | null>> {
    return authService.getSession();
  }
  
  public static async getProfile(): Promise<AuthResponse<AuthProfile | null>> {
    return authService.getProfile();
  }
  
  public static async login(params: { email: string; password: string }): Promise<AuthResponse<Session | null>> {
    return authService.login(params);
  }
  
  public static async register(params: { email: string; password: string; role: string }): Promise<AuthResponse<Session | null>> {
    return authService.register(params);
  }
  
  public static async logout(): Promise<AuthResponse<void>> {
    return authService.logout();
  }
  
  public static async resetPassword(email: string): Promise<AuthResponse<void>> {
    return authService.resetPassword(email);
  }
  
  public static async updatePassword(newPassword: string): Promise<AuthResponse<void>> {
    return authService.updatePassword(newPassword);
  }
  
  public static async verifyEmail(code: string): Promise<AuthResponse<void>> {
    return authService.verifyEmail(code);
  }
  
  public static async resendVerification(): Promise<AuthResponse<void>> {
    return authService.resendVerification();
  }
  
  public static async updateProfile(data: Partial<AuthProfile>): Promise<AuthResponse<AuthProfile | null>> {
    return authService.updateProfile(data);
  }
  
  public static async refreshSession(): Promise<AuthResponse<Session | null>> {
    return authService.refreshSession();
  }
  
  public static async verifyOTP(params: { 
    type: 'totp' | 'email' | 'sms' | 'phone', 
    code: string,
    token?: string 
  }): Promise<AuthResponse<{ session: Session | null }>> {
    return authService.verifyOTP(params);
  }
  
  public static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return authService.onAuthStateChange(callback);
  }
} 