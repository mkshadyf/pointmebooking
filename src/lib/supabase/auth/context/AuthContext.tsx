'use client';

import { AuthContextType, AuthError, AuthProfile, AuthResponse, AuthResult, AuthRole } from '@/types/database/auth';
import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService } from '../../services/auth/auth.service';

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Authentication provider component
 * Manages authentication state and provides auth methods to children
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Authentication state
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<AuthError | null>(null);
    const [authError, setAuthError] = useState<AuthError | null>(null);
    const [, setInitialized] = useState(false);
    
    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
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
    const login = async (email: string, password: string): Promise<AuthResponse<AuthResult>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const loginParams = { email, password };
            const response = await authService.login(loginParams);
            
            if (response.error) {
                console.error('Login error:', response.error);
                setAuthError(response.error);
                return { data: null, error: response.error };
            } 
            
            if (response.data) {
                // After login, get the user profile
                const profileResponse = await authService.getProfile();
                
                if (profileResponse.error) {
                    console.error('Profile fetch error:', profileResponse.error);
                    setAuthError(profileResponse.error);
                }
                
                // Set session from login response
                setSession(response.data);
                
                // Set user from session
                if (response.data.user) {
                    setUser(response.data.user);
                }
                
                // Set profile from profile response
                if (profileResponse.data) {
                    setProfile(profileResponse.data);
                }
                
                setIsAuthenticated(true);
                
                // Construct AuthResult from response data
                const result: AuthResult = {
                    user: profileResponse.data || null,
                    session: response.data,
                    supabaseUser: response.data.user || null
                };
                
                setIsLoading(false);
                return { data: result, error: null };
            }
            
            setIsLoading(false);
            return { data: null, error: null };
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled login error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null, error };
        }
    };
    
    // Register method
    const register = async (email: string, password: string, role: AuthRole): Promise<AuthResponse<AuthResult>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const registerParams = { email, password, role };
            const response = await authService.register(registerParams);
            
            if (response.error) {
                console.error('Registration error:', response.error);
                setAuthError(response.error);
                return { data: null, error: response.error };
            } 
            
            if (response.data) {
                // After registration, get the user profile
                const profileResponse = await authService.getProfile();
                
                if (profileResponse.error) {
                    console.error('Profile fetch error:', profileResponse.error);
                    setAuthError(profileResponse.error);
                }
                
                // Set session from registration response
                setSession(response.data);
                
                // Set user from session
                if (response.data.user) {
                    setUser(response.data.user);
                }
                
                // Set profile from profile response
                if (profileResponse.data) {
                    setProfile(profileResponse.data);
                }
                
                setIsAuthenticated(true);
                
                // Construct AuthResult from response data
                const result: AuthResult = {
                    user: profileResponse.data || null,
                    session: response.data,
                    supabaseUser: response.data.user || null
                };
                
                setIsLoading(false);
                return { data: result, error: null };
            }
            
            setIsLoading(false);
            return { data: null, error: null };
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled registration error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null, error };
        }
    };
    
    // Sign out method
    const signOut = async (): Promise<AuthResponse<void>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const response = await authService.logout();
            
            if (response.error) {
                console.error('Signout error:', response.error);
                setAuthError(response.error);
            } else {
                setUser(null);
                setProfile(null);
                setSession(null);
                setIsAuthenticated(false);
            }
            
            setIsLoading(false);
            return response;
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled signout error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null, error };
        }
    };
    
    // Update profile method
    const updateProfile = async (data: Partial<AuthProfile>): Promise<AuthResponse<AuthProfile>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const response = await authService.updateProfile(data);
            
            if (response.error) {
                console.error('Profile update error:', response.error);
                setAuthError(response.error);
                return { data: null as unknown as AuthProfile, error: response.error };
            } 
            
            if (response.data) {
                setProfile(response.data);
                setIsLoading(false);
                return { data: response.data, error: null };
            }
            
            setIsLoading(false);
            return { data: null as unknown as AuthProfile, error: null };
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled profile update error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null as unknown as AuthProfile, error };
        }
    };
    
    // Verify email method
    const verifyEmail = async (code: string): Promise<AuthResponse<void>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const response = await authService.verifyEmail(code);
            
            if (response.error) {
                console.error('Email verification error:', response.error);
                setAuthError(response.error);
            } 
            
            setIsLoading(false);
            return response;
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled email verification error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null, error };
        }
    };
    
    // Resend verification email method
    const resendVerification = async (): Promise<AuthResponse<void>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const response = await authService.resendVerification();
            
            if (response.error) {
                console.error('Resend verification error:', response.error);
                setAuthError(response.error);
            }
            
            setIsLoading(false);
            return response;
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled resend verification error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null, error };
        }
    };
    
    // Reset password method
    const resetPassword = async (email: string): Promise<AuthResponse<void>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const response = await authService.resetPassword(email);
            
            if (response.error) {
                console.error('Password reset error:', response.error);
                setAuthError(response.error);
            }
            
            setIsLoading(false);
            return response;
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled password reset error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null, error };
        }
    };
    
    // Update password method
    const updatePassword = async (newPassword: string): Promise<AuthResponse<void>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const response = await authService.updatePassword(newPassword);
            
            if (response.error) {
                console.error('Password update error:', response.error);
                setAuthError(response.error);
            }
            
            setIsLoading(false);
            return response;
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled password update error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null, error };
        }
    };
    
    // Refresh session method
    const refreshSession = async (): Promise<AuthResponse<AuthResult>> => {
        setIsLoading(true);
        setAuthError(null);
        
        try {
            const sessionResponse = await authService.getSession();
            
            if (sessionResponse.error) {
                console.error('Session refresh error:', sessionResponse.error);
                setAuthError(sessionResponse.error);
                return { data: null, error: sessionResponse.error };
            }
            
            if (sessionResponse.data) {
                // Set session from response
                setSession(sessionResponse.data);
                
                // Set user from session
                if (sessionResponse.data.user) {
                    setUser(sessionResponse.data.user);
                }
                
                // Also fetch profile data
                const profileResponse = await authService.getProfile();
                
                if (profileResponse.error) {
                    console.error('Profile fetch error:', profileResponse.error);
                    setAuthError(profileResponse.error);
                } else if (profileResponse.data) {
                    setProfile(profileResponse.data);
                }
                
                setIsAuthenticated(!!profileResponse.data);
                
                // Construct AuthResult from response data
                const result: AuthResult = {
                    user: profileResponse.data || null,
                    session: sessionResponse.data,
                    supabaseUser: sessionResponse.data.user || null
                };
                
                setIsLoading(false);
                return { data: result, error: null };
            }
            
            setIsLoading(false);
            return { data: null, error: null };
        } catch (err) {
            const error = err as AuthError;
            console.error('Unhandled session refresh error:', error);
            setAuthError(error);
            setIsLoading(false);
            return { data: null, error };
        }
    };
    
    // Create the context value
    const value = {
        // User data
        user,
        profile,
        session,
        
        // Auth state
        isLoading,
        isAuthenticated,
        error: authError,
        
        // Auth methods
        login,
        register,
        signOut,
        updateProfile,
        verifyEmail,
        resendVerification,
        resetPassword,
        updatePassword,
        refreshSession,
    };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};