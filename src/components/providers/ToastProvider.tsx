'use client';

import { useToastService } from '@/hooks/ui/useToastService';
import React, { useEffect } from 'react';

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * ToastProvider component
 * Initializes the toast service for use throughout the application
 */
export function ToastProvider({ children }: ToastProviderProps) {
  // Initialize toast service
  const toast = useToastService();
  
  useEffect(() => {
    // Log for debugging
    console.log('ToastProvider mounted');
    
    if (toast) {
      console.log('Toast methods available:', 
        Object.keys(toast).filter(key => typeof toast[key as keyof typeof toast] === 'function'));
    } else {
      console.warn('Toast is not available in ToastProvider');
    }
  }, [toast]);
  
  return <>{children}</>;
} 