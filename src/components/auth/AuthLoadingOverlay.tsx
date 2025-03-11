'use client';

import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

// Map of operation names to user-friendly loading messages
const OPERATION_MESSAGES: Record<string, string> = {
  login: 'Signing you in...',
  register: 'Creating your account...',
  signOut: 'Signing you out...',
  googleSignIn: 'Signing in with Google...',
  resetPassword: 'Sending password reset email...',
  verifyEmail: 'Verifying your email...',
  updateProfile: 'Updating your profile...',
  deleteAccount: 'Deleting your account...',
  // Add more operations as needed
};

/**
 * A loading overlay that displays during authentication operations
 */
export interface AuthLoadingOverlayProps {
  className?: string;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({ className }) => {
  // Get the auth state from the auth hook
  const auth = useAuth();
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  
  // Track loading state
  useEffect(() => {
    if (auth.isLoading) {
      // Try to determine the current operation based on context
      // This is a simplified approach - in a real app, you might want to track this more precisely
      if (window.location.pathname.includes('login')) {
        setCurrentOperation('login');
      } else if (window.location.pathname.includes('register')) {
        setCurrentOperation('register');
      } else if (window.location.pathname.includes('reset-password')) {
        setCurrentOperation('resetPassword');
      } else if (window.location.pathname.includes('verify-email')) {
        setCurrentOperation('verifyEmail');
      } else {
        setCurrentOperation(null);
      }
    }
  }, [auth.isLoading]);
  
  // If not loading, don't render anything
  if (!auth.isLoading) {
    return null;
  }
  
  // Get the appropriate message for the current operation
  const message = currentOperation ? 
    (OPERATION_MESSAGES[currentOperation] || 'Loading...') : 
    'Processing...';
  
  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm',
        className
      )}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

/**
 * Higher-order component that wraps a component with the AuthLoadingOverlay
 */
export function withAuthLoadingOverlay<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithAuthLoadingOverlay(props: P) {
    return (
      <>
        <Component {...props} />
        <AuthLoadingOverlay />
      </>
    );
  };
} 