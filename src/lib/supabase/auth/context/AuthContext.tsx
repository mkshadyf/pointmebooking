'use client';

import { ErrorHandler } from '@/lib/error-handling';
import { supabase } from '@/lib/supabase/client';
import { AuthError, AuthProfile, AuthRole, DbProfile } from '@/types/database/auth';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
import { AuthService } from '../../services/auth.service';
import { useStore } from '../../store/store';

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

const createAuthProfile = (profile: DbProfile): AuthProfile => ({
    ...profile,
    // Additional auth-specific fields
    is_verified: profile.email_verified ?? false,
    is_email_verified: profile.email_verified ?? false,
    last_login: null,
    login_count: 0,
    failed_login_attempts: 0,
    last_failed_login: null,
    password_reset_token: null,
    password_reset_expires: null
});

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useStore();
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            store.setIsLoading(true);
            try {
                const session = await AuthService.getSession();
                if (session.data?.user) {
                    store.setUser(session.data.user);
                    const profile = await AuthService.getProfile();
                    if (profile.data) {
                        store.setProfile(createAuthProfile(profile.data));
                    }
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.init');
                console.error('Authentication initialization failed:', appError);
                store.setError(appError as AuthError);
            } finally {
                store.setIsLoading(false);
            }
        };

        initAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log(`Supabase auth event: ${event}`);

                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    if (session?.user) {
                        store.setUser(session.user);
                        store.setIsAuthenticated(true);

                        const profile = await AuthService.getProfile();
                        if (profile.data) {
                            store.setProfile(createAuthProfile(profile.data));
                        }
                    }
                } else if (event === 'SIGNED_OUT') {
                    store.setUser(null);
                    store.setIsAuthenticated(false);
                    store.setProfile(null);
                    router.push('/login');
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [router, store]);

    const value: AuthContextType = {
        user: store.user,
        profile: store.profile,
        isLoading: store.isLoading,
        isAuthenticated: store.isAuthenticated,
        error: store.error,
        login: async (email: string, password: string) => {
            store.setIsLoading(true);
            try {
                const result = await AuthService.login({ email, password });
                if (result.error) {
                    throw result.error;
                }
                if (result.data) {
                    store.setUser(result.data.supabaseUser);
                    store.setProfile(result.data.user);
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.login');
                console.error('Login failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        },
        register: async (email: string, password: string, role: AuthRole) => {
            store.setIsLoading(true);
            try {
                const result = await AuthService.register(email, password, role);
                if (result.error) {
                    throw result.error;
                }
                if (result.data) {
                    store.setUser(result.data.supabaseUser);
                    store.setProfile(result.data.user);
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.register');
                console.error('Register failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        },
        signOut: async () => {
            store.setIsLoading(true);
            try {
                const result = await AuthService.logout();
                if (result.error) {
                    throw result.error;
                }
                store.setUser(null);
                store.setProfile(null);
                store.setIsAuthenticated(false);
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.signOut');
                console.error('Sign out failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        },
        updateProfile: async (data) => {
            store.setIsLoading(true);
            try {
                const result = await AuthService.updateProfile(data);
                if (result.error) {
                    throw result.error;
                }
                if (result.data) {
                    store.setProfile(createAuthProfile(result.data));
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.updateProfile');
                console.error('Update profile failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        },
        verifyEmail: async (code) => {
            store.setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user?.email) {
                    throw new Error('No email found for current user');
                }
                const result = await AuthService.verifyEmail(user.email, code);
                if (result.error) {
                    throw result.error;
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.verifyEmail');
                console.error('Email verification failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        },
        resendVerification: async () => {
            store.setIsLoading(true);
            try {
                const result = await AuthService.resendVerificationEmail();
                if (result.error) {
                    throw result.error;
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.resendVerification');
                console.error('Resend verification failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        },
        resetPassword: async (email) => {
            store.setIsLoading(true);
            try {
                const result = await AuthService.resetPassword(email);
                if (result.error) {
                    throw result.error;
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.resetPassword');
                console.error('Reset password failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        },
        updatePassword: async (newPassword) => {
            store.setIsLoading(true);
            try {
                const result = await AuthService.updatePassword(newPassword);
                if (result.error) {
                    throw result.error;
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.updatePassword');
                console.error('Update password failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        },
        refreshSession: async () => {
            store.setIsLoading(true);
            try {
                const result = await AuthService.refreshSession();
                if (result.error) {
                    throw result.error;
                }
                if (result.data) {
                    const user = result.data.user;
                    if (user) {
                        store.setUser(user);
                        const profile = await AuthService.getProfile();
                        if (profile.data) {
                            store.setProfile(createAuthProfile(profile.data));
                        }
                    }
                }
            } catch (error) {
                const appError = ErrorHandler.convertToAppError(error, 'auth.refreshSession');
                console.error('Session refresh failed:', appError);
                store.setError(appError as AuthError);
                throw appError;
            } finally {
                store.setIsLoading(false);
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};