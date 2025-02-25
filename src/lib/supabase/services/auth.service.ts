import { AppError, ErrorHandler, ErrorType } from '@/lib/error-handling';
import { AuthError, AuthProfile, AuthResponse, AuthResult, AuthRole, DbProfile, LoginCredentials } from '@/types/database/auth';
import { Database } from '@generated.types';
import { PostgrestError, Session, User } from '@supabase/supabase-js';
import { supabase } from '../client';
import { BaseServiceUtils } from './BaseService';

// Define the type for inserting a new profile based on the generated types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export interface AuthLoginResponse {
    user: User;
    session: Session | null;
}

// Convert PostgrestError to AuthError
const toAuthError = (error: PostgrestError): AuthError => ({
    name: error.code,
    message: error.message,
    code: error.code,
    status: Number(error.code) || 500,
    details: { hint: error.hint, details: error.details }
});

export class AuthService extends BaseServiceUtils {
    static async login(credentials: LoginCredentials): Promise<AuthResponse<AuthResult>> {
        try {
            // Use retry mechanism for network operations
            const authData = await this.withRetry(
                async () => {
                    const { data, error } = await supabase.auth.signInWithPassword(credentials);
                    if (error) throw error;
                    return data;
                },
                { context: 'AuthService.login' }
            );
            
            const profile = await this.withRetry(
                async () => {
                    const { data, error } = await this.getProfile();
                    if (error) throw error;
                    return data;
                },
                { context: 'AuthService.login.getProfile' }
            );

            return {
                data: {
                    user: profile as AuthProfile,
                    session: authData.session,
                    supabaseUser: authData.user
                },
                error: null
            };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.login');
            return { data: null, error: appError as AuthError };
        }
    }

    static async register(email: string, password: string, role: AuthRole): Promise<AuthResponse<AuthResult>> {
        try {
            // Use retry mechanism for network operations
            const authData = await this.withRetry(
                async () => {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { role }
                        }
                    });
                    if (error) throw error;
                    return data;
                },
                { context: 'AuthService.register' }
            );

            // Check if user is null
            if (!authData.user) {
                const error = new AppError(
                    'Failed to create user',
                    ErrorType.AUTHENTICATION,
                    null,
                    500
                );
                return { data: null, error: error as AuthError };
            }

            // Create profile with retry
            const profile = await this.withRetry(
                async () => {
                    const { data, error } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                user_id: authData.user!.id,
                                email,
                                role,
                                status: 'active'
                            }
                        ])
                        .select()
                        .single();
                    
                    if (error) throw error;
                    return data;
                },
                { context: 'AuthService.register.createProfile' }
            );

            return {
                data: {
                    user: profile as AuthProfile,
                    session: authData.session,
                    supabaseUser: authData.user
                },
                error: null
            };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.register');
            return { data: null, error: appError as AuthError };
        }
    }

    static async logout(): Promise<AuthResponse<boolean>> {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                return { data: false, error };
            }
            
            return { data: true, error: null };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.logout');
            return { data: false, error: appError as AuthError };
        }
    }

    static async getUser(): Promise<AuthResponse<User | null>> {
        try {
            const { data, error } = await supabase.auth.getUser();
            
            if (error) {
                return { data: null, error };
            }
            
            return { data: data.user, error: null };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.getUser');
            return { data: null, error: appError as AuthError };
        }
    }

    static async getProfile(): Promise<AuthResponse<AuthProfile | null>> {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
                return { data: null, error: userError };
            }
            
            if (!userData.user) {
                return { data: null, error: null };
            }
            
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userData.user.id)
                .single();
                
            if (profileError) {
                return { data: null, error: toAuthError(profileError) };
            }
            
            return { data: profile as AuthProfile, error: null };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.getProfile');
            return { data: null, error: appError as AuthError };
        }
    }

    static async getSession(): Promise<AuthResponse<Session>> {
        try {
            const { data, error } = await supabase.auth.getSession();
            return { data: data.session, error };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.getSession');
            return { data: null, error: appError as AuthError };
        }
    }

    static async refreshSession(): Promise<AuthResponse<Session>> {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            return { data: data.session, error };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.refreshSession');
            return { data: null, error: appError as AuthError };
        }
    }

    static async updateProfile(data: Partial<AuthProfile>): Promise<AuthResponse<DbProfile>> {
        try {
            const { data: session } = await supabase.auth.getSession();
            
            if (!session.session?.user) {
                const error = new AppError(
                    'No authenticated user found',
                    ErrorType.AUTHENTICATION,
                    null,
                    401
                );
                return { data: null, error: error as AuthError };
            }
            
            const { data: updatedProfile, error } = await supabase
                .from('profiles')
                .update(data)
                .eq('user_id', session.session.user.id)
                .select()
                .single();
                
            return { data: updatedProfile, error: error ? toAuthError(error) : null };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.updateProfile');
            return { data: null, error: appError as AuthError };
        }
    }

    static async verifyEmail(email: string, token: string): Promise<AuthResponse<void>> {
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email'
            });
            
            return { data: null, error };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.verifyEmail');
            return { data: null, error: appError as AuthError };
        }
    }

    static async resetPassword(email: string): Promise<AuthResponse<void>> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            return { data: null, error };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.resetPassword');
            return { data: null, error: appError as AuthError };
        }
    }

    static async updatePassword(newPassword: string): Promise<AuthResponse<void>> {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            return { data: null, error };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.updatePassword');
            return { data: null, error: appError as AuthError };
        }
    }

    static async resendVerificationEmail(): Promise<AuthResponse<void>> {
        try {
            const { data: session } = await supabase.auth.getSession();
            
            if (!session.session?.user?.email) {
                const error = new AppError(
                    'No authenticated user found or email missing',
                    ErrorType.AUTHENTICATION,
                    null,
                    401
                );
                return { data: null, error: error as AuthError };
            }
            
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: session.session.user.email
            });
            
            return { data: null, error };
        } catch (error) {
            const appError = ErrorHandler.convertToAppError(error, 'auth.resendVerificationEmail');
            return { data: null, error: appError as AuthError };
        }
    }
} 