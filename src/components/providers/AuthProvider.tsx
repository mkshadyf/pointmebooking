'use client';

import { useAuth, User } from '@/hooks/useAuth';
import { createContext, ReactNode, useContext } from 'react';

// Define the Auth Context type
export interface AuthContextType {
  user: User;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean, data?: any, error?: any }>;
  signup: (email: string, password: string) => Promise<{ success: boolean, data?: any, error?: any }>;
  logout: () => Promise<{ success: boolean, error?: any }>;
  resetPassword: (email: string) => Promise<{ success: boolean, error?: any }>;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Export the Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
} 