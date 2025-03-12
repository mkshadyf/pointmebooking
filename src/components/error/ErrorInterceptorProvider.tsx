'use client';

import { initializeErrorInterception } from '@/lib/error/error-interceptor';
import { ReactNode, useEffect } from 'react';

interface ErrorInterceptorProviderProps {
  children: ReactNode;
}

/**
 * Error Interceptor Provider
 * 
 * Sets up global error interception to ensure empty errors are
 * always caught and handled properly before they reach error handlers.
 */
export function ErrorInterceptorProvider({ children }: ErrorInterceptorProviderProps): JSX.Element {
  useEffect(() => {
    // Initialize error interception on client side
    if (typeof window !== 'undefined') {
      initializeErrorInterception();
      console.log('[ErrorInterceptorProvider] Global error interception enabled');
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return <>{children}</>;
} 