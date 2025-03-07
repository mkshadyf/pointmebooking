'use client';

import { AuthContextType, AuthError, AuthProfile } from '@/types/database/auth';
import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthService } from '../../services/auth/auth.service';

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({
    // User data
    user: null,
    profile: null,
    session: null,
    
    // Auth state
    isLoading: true,
    isAuthenticated: false,
    error: null,
    
    // Auth actions - these will be implemented in the provider
    login: async () => {},
    register: async () => {},
    signOut: async () => {},
    updateProfile: async () => {},
    verifyEmail: async () => {},
    resendVerification: async () => {},
    resetPassword: async () => {},
    updatePassword: async () => {},
    refreshSession: async () => {},
});

/**
 * Authentication provider component
 * Manages authentication state and provides auth methods to children
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    // Authentication state
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState<AuthError | null>(null);
    const [, setInitialized] = useState(false);
    
    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Get auth service instance
                const authService = AuthService.getInstance();
            
            // Get current session
                const { data: sessionData, error: sessionError } = await authService.getSession();
                
                if (sessionError) {
                    throw sessionError;
                }
                
                if (sessionData) {
                    setSession(sessionData);
                    setUser(sessionData.user);
                    setIsAuthenticated(true);
                    
                    // Get profile data
                    const { data: profileData, error: profileError } = await authService.getProfile();
                    
                    if (profileError) {
                        throw profileError;
                    }
                    
                    if (profileData) {
                        setProfile(profileData);
                    }
                }
            } catch (err: any) {
                console.error('Auth initialization error:', err);
                setAuthError({
                    name: 'AuthInitError',
                    message: err.message || 'Failed to initialize authentication',
                    __isAuthError: true
                });
            } finally {
                setIsLoading(false);
                setInitialized(true);
            }
        };
        
        initAuth();
    }, []);
    
    // Login method
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const authService = AuthService.getInstance();
            const { data, error } = await authService.login({ email, password });
            
            if (error) {
                throw error;
            }
            
            if (data) {
                setSession(data);
                setUser(data.user);
                setIsAuthenticated(true);
                
                // Get profile after login
                const { data: profileData } = await authService.getProfile();
                if (profileData) {
                    setProfile(profileData);
                }
            }
        } catch (err: any) {
            setAuthError({
                name: 'LoginError',
                message: err.message || 'Failed to login',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
            }
    };
        
    // Register method
    const register = async (email: string, password: string, role: string) => {
            setIsLoading(true);
        try {
            const authService = AuthService.getInstance();
            const { data, error } = await authService.register({ email, password, role });
            
            if (error) {
                throw error;
            }
            
            if (data) {
                setSession(data);
                setUser(data.user);
                setIsAuthenticated(true);
                
                // Get profile after registration
                const { data: profileData } = await authService.getProfile();
                if (profileData) {
                    setProfile(profileData);
                }
            }
        } catch (err: any) {
            setAuthError({
                name: 'RegisterError',
                message: err.message || 'Failed to register',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
            }
    };
        
    // Sign out method
    const signOut = async () => {
            setIsLoading(true);
            try {
            const authService = AuthService.getInstance();
            const { error } = await authService.logout();
            
            if (error) {
                throw error;
            }
            
            setSession(null);
                setUser(null);
                setProfile(null);
                setIsAuthenticated(false);
        } catch (err: any) {
            setAuthError({
                name: 'SignOutError',
                message: err.message || 'Failed to sign out',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
            }
    };
        
    // Update profile method
    const updateProfile = async (data: Partial<AuthProfile>) => {
            setIsLoading(true);
            try {
            if (!user) {
                throw new Error('No user logged in');
            }
            
            const authService = AuthService.getInstance();
            const { data: updatedProfile, error } = await authService.updateProfile(data);
            
            if (error) {
                throw error;
            }
            
            if (updatedProfile) {
                setProfile(updatedProfile);
            }
        } catch (err: any) {
            setAuthError({
                name: 'UpdateProfileError',
                message: err.message || 'Failed to update profile',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
            }
    };
        
    // Verify email method
    const verifyEmail = async (code: string) => {
            setIsLoading(true);
            try {
            const authService = AuthService.getInstance();
            const { error } = await authService.verifyEmail(code);
            
            if (error) {
                throw error;
            }
        } catch (err: any) {
            setAuthError({
                name: 'VerifyEmailError',
                message: err.message || 'Failed to verify email',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
            }
    };
        
    // Resend verification method
    const resendVerification = async () => {
            setIsLoading(true);
            try {
            const authService = AuthService.getInstance();
            const { error } = await authService.resendVerification();
            
            if (error) {
                throw error;
            }
        } catch (err: any) {
            setAuthError({
                name: 'ResendVerificationError',
                message: err.message || 'Failed to resend verification',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
            }
    };
        
    // Reset password method
    const resetPassword = async (email: string) => {
            setIsLoading(true);
            try {
            const authService = AuthService.getInstance();
            const { error } = await authService.resetPassword(email);
            
            if (error) {
                throw error;
            }
        } catch (err: any) {
            setAuthError({
                name: 'ResetPasswordError',
                message: err.message || 'Failed to reset password',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
            }
    };
        
    // Update password method
    const updatePassword = async (newPassword: string) => {
            setIsLoading(true);
            try {
            const authService = AuthService.getInstance();
            const { error } = await authService.updatePassword(newPassword);
            
            if (error) {
                throw error;
            }
        } catch (err: any) {
            setAuthError({
                name: 'UpdatePasswordError',
                message: err.message || 'Failed to update password',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
            }
    };
        
    // Refresh session method
    const refreshSession = async () => {
            setIsLoading(true);
            try {
            const authService = AuthService.getInstance();
            const { data, error } = await authService.refreshSession();
            
            if (error) {
                throw error;
            }
            
            if (data) {
                setSession(data);
                setUser(data.user);
                setIsAuthenticated(Boolean(data));
            }
        } catch (err: any) {
            setAuthError({
                name: 'RefreshSessionError',
                message: err.message || 'Failed to refresh session',
                __isAuthError: true
            });
                throw err;
            } finally {
                setIsLoading(false);
        }
    };
    
    // Return the auth context provider with all values and methods
    return (
        <AuthContext.Provider
            value={{
                // State
                user,
                profile,
                session,
                isLoading,
                isAuthenticated,
                error: authError,
                
                // Methods
                login,
                register,
                signOut,
                updateProfile,
                verifyEmail,
                resendVerification,
                resetPassword,
                updatePassword,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Export the useAuth hook from this file for backward compatibility
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};