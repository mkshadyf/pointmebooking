'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/ui/useToast';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SessionCheckerProps {
  checkIntervalMinutes?: number;
  redirectOnExpiry?: boolean;
  redirectPath?: string;
  silentRefresh?: boolean;
}

/**
 * SessionChecker component that periodically validates the user's session
 * 
 * This component should be added to layouts where authenticated content is displayed
 * It helps prevent session mismatch issues by periodically checking and refreshing the session
 */
export const SessionChecker: React.FC<SessionCheckerProps> = ({
  checkIntervalMinutes = 15,
  redirectOnExpiry = true,
  redirectPath = '/login',
  silentRefresh = true,
}) => {
  const { isAuthenticated, user, validateSession, refreshSession } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    // Only set up the interval if the user is authenticated
    if (isAuthenticated && user) {
      // Initial check on mount
      checkSession();
      
      // Set up the interval for periodic checks
      const intervalMs = checkIntervalMinutes * 60 * 1000;
      checkIntervalRef.current = setInterval(checkSession, intervalMs);
      
      // Clean up on unmount
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, user, checkIntervalMinutes]);
  
  const checkSession = async () => {
    // Skip if already checking
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const isValid = await validateSession();
      
      if (!isValid) {
        // Handle invalid session based on props
        if (silentRefresh) {
          try {
            await refreshSession();
            // Session refreshed successfully
            toast.success('Your session has been refreshed successfully');
          } catch (refreshError) {
            // Failed to refresh, handle based on redirectOnExpiry
            handleExpiredSession();
          }
        } else {
          // No silent refresh, handle directly
          handleExpiredSession();
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleExpiredSession = () => {
    if (redirectOnExpiry) {
      toast.warning('Your session has expired. Please log in again.', {
        title: 'Session Expired'
      });
      router.push(redirectPath);
    } else {
      toast.warning('Your session may have expired. Please refresh the page or log in again.', {
        title: 'Session Issue Detected'
      });
    }
  };
  
  // This is a background component, no UI needed
  return null;
};

export default SessionChecker; 