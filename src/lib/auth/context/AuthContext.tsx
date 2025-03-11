'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { AuthProfile } from '@/types/auth';
import { AuthError } from '@/types/database/auth';
import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext } from 'react';

/**
 * Auth context type definition
 */
interface AuthContextType {
  // User state
  user: User | null;
  profile: AuthProfile | null;
  session: Session | null;
  
  // Auth state
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  
  // Additional methods for compatibility with updated components
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  updatePasswordWithToken: (token: string, newPassword: string) => Promise<{ error: AuthError | null }>;
}

/**
 * Create the auth context with default values
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Auth provider component
 * Provides auth state and methods to children
 */
export function AuthProvider({ children, redirectTo }: AuthProviderProps) {
  // Use the consolidated auth hook
  const auth = useAuth({ redirectTo });
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 * @returns The auth context
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
} 