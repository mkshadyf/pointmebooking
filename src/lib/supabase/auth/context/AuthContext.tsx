'use client';

import { createContext, useContext, useEffect } from 'react';
import { AuthService } from '../../services/auth.service';
import { useStore } from '../../store/store';
import type { AuthContextType, AuthProfile, AuthRole } from '../../types/auth.types';

export type { AuthContextType };

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useStore();

    useEffect(() => {
        const initAuth = async () => {
            store.setIsLoading(true);
            try {
                const session = await AuthService.getSession();
                if (session) {
                    const profile = await AuthService.getProfile();
                    if (profile) {
                        const authProfile: AuthProfile = {
                            ...profile,
                            verification_attempts: profile.verification_attempts || 0,
                            role: profile.role as AuthRole
                        };
                        store.setUser(authProfile);
                        store.setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
            } finally {
                store.setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const value: AuthContextType = {
        user: store.user,
        profile: store.user,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        login: async (email: string, password: string) => {
            store.setIsLoading(true);
            try {
                const { user } = await AuthService.login({ email, password });
                if (user) {
                    const profile = await AuthService.getProfile();
                    if (profile) {
                        const authProfile: AuthProfile = {
                            ...profile,
                            verification_attempts: profile.verification_attempts || 0,
                            role: profile.role as AuthRole
                        };
                        store.setUser(authProfile);
                        store.setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            } finally {
                store.setIsLoading(false);
            }
        },
        register: async (email: string, password: string, role: AuthRole) => {
            store.setIsLoading(true);
            try {
                const { user } = await AuthService.register({ email, password, role });
                if (user) {
                    const profile = await AuthService.getProfile();
                    if (profile) {
                        store.setUser(profile);
                        store.setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.error('Registration failed:', error);
                throw error;
            } finally {
                store.setIsLoading(false);
            }
        },
        signOut: async () => {
            store.setIsLoading(true);
            try {
                await AuthService.logout();
                store.setUser(null);
                store.setIsAuthenticated(false);
            } catch (error) {
                console.error('Logout failed:', error);
                throw error;
            } finally {
                store.setIsLoading(false);
            }
        },
        updateProfile: async (data) => {
            store.setIsLoading(true);
            try {
                const profile = await AuthService.updateProfile(data);
                store.setUser(profile);
            } catch (error) {
                console.error('Profile update failed:', error);
                throw error;
            } finally {
                store.setIsLoading(false);
            }
        }
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