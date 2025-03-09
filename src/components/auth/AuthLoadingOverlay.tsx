'use client';

import { Spinner } from '@/components/ui/Spinner';
import { useAuthState } from '@/lib/auth/authFeedback';
import { cn } from '@/lib/utils';
import React from 'react';

// Map of operation names to user-friendly loading messages
const operationMessages: Record<string, string> = {
  'login': 'Signing you in...',
  'register': 'Creating your account...',
  'logout': 'Signing you out...',
  'reset-password': 'Resetting your password...',
  'forgot-password': 'Sending reset instructions...',
  'verify-email': 'Verifying your email...',
  'google-signin': 'Signing in with Google...',
  'check-session': 'Checking your session...',
  'refresh-session': 'Refreshing your session...',
  'update-profile': 'Updating your profile...',
  'default': 'Processing your request...'
};

export interface AuthLoadingOverlayProps {
  className?: string;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({ className }) => {
  const { isLoading, currentOperation } = useAuthState();
  
  if (!isLoading) return null;
  
  // Get the appropriate message for the current operation
  const message = currentOperation ? 
    (operationMessages[currentOperation] || operationMessages.default) : 
    operationMessages.default;
  
  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-opacity duration-300",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-md mx-auto">
        <Spinner size="lg" className="text-primary mb-4" />
        <h3 className="text-lg font-medium text-gray-900">{message}</h3>
        <p className="mt-2 text-sm text-gray-500">
          This may take a moment. Please don't close this page.
        </p>
      </div>
    </div>
  );
};

// Higher-order component to wrap components with the loading overlay
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