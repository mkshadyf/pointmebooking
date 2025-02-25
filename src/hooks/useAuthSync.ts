import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UseAuthSyncOptions {
  redirectToLogin?: boolean;
  requireAuth?: boolean;
  redirectPath?: string;
}

export function useAuthSync({
  redirectToLogin = true,
  requireAuth = true,
  redirectPath = '/login',
}: UseAuthSyncOptions = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [sessionChecked, setSessionChecked] = useState(false);

  // Update last activity time on user interactions
  useEffect(() => {
    const updateActivityTime = () => {
      setLastActivityTime(Date.now());
    };

    // Add event listeners for user activity
    window.addEventListener('click', updateActivityTime);
    window.addEventListener('keypress', updateActivityTime);
    window.addEventListener('scroll', updateActivityTime);
    window.addEventListener('mousemove', updateActivityTime);

    return () => {
      window.removeEventListener('click', updateActivityTime);
      window.removeEventListener('keypress', updateActivityTime);
      window.removeEventListener('scroll', updateActivityTime);
      window.removeEventListener('mousemove', updateActivityTime);
    };
  }, []);

  // Check for session expiration periodically
  useEffect(() => {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    const checkSessionExpiration = () => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivityTime;
      
      if (user && timeSinceLastActivity > SESSION_TIMEOUT) {
        showToast({
          type: 'warning',
          message: 'Your session has expired due to inactivity. Please log in again.'
        });
        // Force logout
        router.push(`${redirectPath}?redirect=${encodeURIComponent(pathname)}&expired=true`);
      }
    };
    
    const interval = setInterval(checkSessionExpiration, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user, lastActivityTime, pathname, redirectPath, router, showToast]);

  // Handle authentication state
  useEffect(() => {
    if (!loading) {
      const isUserAuthenticated = !!user;
      setIsAuthenticated(isUserAuthenticated);
      setSessionChecked(true);

      if (requireAuth && !isUserAuthenticated && redirectToLogin) {
        showToast({
          type: 'info',
          message: 'Please log in to access this page'
        });
        router.push(`${redirectPath}?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [loading, user, requireAuth, redirectToLogin, redirectPath, pathname, router, showToast]);

  return { isAuthenticated, isLoading: loading || !sessionChecked, user };
} 