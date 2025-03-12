'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

/**
 * A loading overlay that displays during authentication operations
 */
export interface AuthLoadingOverlayProps {
  className?: string;
  forceShow?: boolean;
  message?: string;
  isSubmitting?: boolean;
}

export function AuthLoadingOverlay({ 
  className = '',
  forceShow = false, 
  message,
  isSubmitting = false 
}: AuthLoadingOverlayProps) {
  const { isLoading } = useAuth();
  const pathname = usePathname();
  const [currentOperation, setCurrentOperation] = useState('authenticating');
  const [visible, setVisible] = useState(false);
  
  // Debug logging for component state
  useEffect(() => {
    console.log('AuthLoadingOverlay: Component mounted/updated');
  }, []);
  
  // Determine the current operation based on the URL path
  useEffect(() => {
    if (pathname?.includes('login')) {
      setCurrentOperation('signing in');
    } else if (pathname?.includes('register')) {
      setCurrentOperation('creating your account');
    } else if (pathname?.includes('forgot-password')) {
      setCurrentOperation('sending reset instructions');
    } else if (pathname?.includes('reset-password')) {
      setCurrentOperation('resetting your password');
    } else {
      setCurrentOperation('authenticating');
    }
  }, [pathname]);

  // Enhanced debug logging for loading state
  useEffect(() => {
    console.log('AuthLoadingOverlay: State update', { 
      isLoading, 
      isSubmitting, 
      forceShow, 
      pathname,
      visible,
      currentOperation
    });
  }, [isLoading, isSubmitting, forceShow, pathname, visible, currentOperation]);

  // Force immediate visibility when props change
  useEffect(() => {
    if (isLoading || isSubmitting || forceShow) {
      console.log('AuthLoadingOverlay: Setting visible to true IMMEDIATELY', { 
        isLoading, 
        isSubmitting, 
        forceShow 
      });
      // Force immediate visibility
      setVisible(true);
    }
  }, [isLoading, isSubmitting, forceShow]);

  // Handle hiding with delay to prevent flickering
  useEffect(() => {
    // Only proceed with hiding if we're not in a state that should show the overlay
    if (!isLoading && !isSubmitting && !forceShow) {
      console.log('AuthLoadingOverlay: Scheduling hide with delay');
      const timer = setTimeout(() => {
        console.log('AuthLoadingOverlay: Now hiding overlay after delay');
        setVisible(false);
      }, 500); // Increased delay for smoother transitions
      
      return () => {
        console.log('AuthLoadingOverlay: Clearing hide timer');
        clearTimeout(timer);
      };
    }
  }, [isLoading, isSubmitting, forceShow]);

  // Enhanced logging for visibility changes
  useEffect(() => {
    console.log('AuthLoadingOverlay: Visibility changed to', visible);
  }, [visible]);

  // If not visible, don't render anything
  if (!visible) {
    console.log('AuthLoadingOverlay: Not rendering (not visible)');
    return null;
  }

  // Custom message or default based on operation
  const displayMessage = message || `We're ${currentOperation}...`;
  console.log('AuthLoadingOverlay: Rendering with message:', displayMessage);

  return (
    <div className={`fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${className}`}>
      <div className="flex flex-col items-center space-y-6 p-10 rounded-lg bg-white shadow-2xl border border-gray-200 max-w-md w-full mx-4">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900">Please wait</h3>
          <p className="mt-3 text-lg text-gray-700">
            {displayMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

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