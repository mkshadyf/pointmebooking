'use client';

import { supabase } from '@/lib/supabase/client';
import { AuthContextType, AuthProfile, AuthRole } from '@/types/database/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
import { AuthService } from '../../services/auth.service';
import { useStore } from '../../store/store';
import { DbProfile } from '../../types';

const createAuthProfile = (profile: DbProfile): AuthProfile => ({
    ...profile,
    verification_attempts: profile.verification_attempts || 0,
    role: profile.role as AuthRole,
    is_verified: profile.email_verified ?? false,
    is_email_verified: profile.email_verified ?? false,
    email: profile.email || '',
    onboarding_completed: profile.onboarding_completed ?? false,
    working_hours: profile.working_hours || {},
    preferences: profile.preferences || {},
    social_media: profile.social_media || {},
    created_at: profile.created_at || new Date().toISOString(),
    updated_at: profile.updated_at || new Date().toISOString()
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
                if (session) {
                    store.setUser(session.user);
                    const profile = await AuthService.getProfile();
                    if (profile) {
                        store.setProfile(createAuthProfile(profile));
                    }
                }
            } catch (error) {
                console.error('Authentication initialization failed:', error);
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
                        if (profile) {
                            store.setProfile(createAuthProfile(profile));
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
        login: async (email, password) => {
            store.setIsLoading(true);
            try {
                await AuthService.login({ email, password, role: 'customer' });
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            } finally {
                store.setIsLoading(false);
            }
        },
        register: async (email, password, role) => {
            store.setIsLoading(true);
            try {
                await AuthService.register({ email, password, role });
            } catch (error) {
                console.error('Register failed:', error);
                throw error;
            } finally {
                store.setIsLoading(false);
            }
        },
        signOut: async () => {
            store.setIsLoading(true);
            try {
                await AuthService.logout();
            } catch (error) {
                console.error('Sign out failed:', error);
                throw error;
            } finally {
                store.setIsLoading(false);
            }
        },
        updateProfile: async (data) => {
            store.setIsLoading(true);
            try {
                await AuthService.updateProfile(data);
            } catch (error) {
                console.error('Update profile failed:', error);
                throw error;
            } finally {
                store.setIsLoading(false);
            }
        },
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