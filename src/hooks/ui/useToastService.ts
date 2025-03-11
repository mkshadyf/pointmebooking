import { ToastService } from '@/lib/core/toast';
import { useEffect, useState } from 'react';
import { useToast } from './useToast';
import { useToastFallback } from './useToast.fallback';

// Define a common interface for toast functions
interface ToastInterface {
  success: (message: string, options?: any) => any;
  error: (message: string, options?: any) => any;
  warning: (message: string, options?: any) => any;
  info: (message: string, options?: any) => any;
}

/**
 * Hook to connect the global ToastService with the React toast hook
 * This allows the ToastService to be used outside of React components
 */
export function useToastService() {
  const [useFallback] = useState(false);
  const originalToast = useToast();
  const fallbackToast = useToastFallback();
  
  // Use fallback if original toast doesn't have the expected methods
  const toast = useFallback ? fallbackToast : originalToast;
  
  useEffect(() => {
    // Create a wrapper object that ensures all expected methods exist
    const toastWrapper: ToastInterface = {
      success: (message: string, options?: any) => {
        try {
          if (toast) {
            // Try to use the toast in different ways
            if (typeof (toast as any).success === 'function') {
              return (toast as any).success(message, options);
            } else if (typeof (toast as any).toast === 'function') {
              return (toast as any).toast({
                title: options?.title,
                description: message,
                status: 'success',
                duration: options?.duration || 5000,
                isClosable: true,
              });
            }
          }
          console.log(`[Toast] SUCCESS: ${options?.title || ''} - ${message}`);
        } catch (error) {
          console.warn('Error showing success toast:', error);
        }
      },
      error: (message: string, options?: any) => {
        try {
          if (toast) {
            // Try to use the toast in different ways
            if (typeof (toast as any).error === 'function') {
              return (toast as any).error(message, options);
            } else if (typeof (toast as any).toast === 'function') {
              return (toast as any).toast({
                title: options?.title,
                description: message,
                status: 'error',
                duration: options?.duration || 5000,
                isClosable: true,
              });
            }
          }
          console.log(`[Toast] ERROR: ${options?.title || ''} - ${message}`);
        } catch (error) {
          console.warn('Error showing error toast:', error);
        }
      },
      warning: (message: string, options?: any) => {
        try {
          if (toast) {
            // Try to use the toast in different ways
            if (typeof (toast as any).warning === 'function') {
              return (toast as any).warning(message, options);
            } else if (typeof (toast as any).toast === 'function') {
              return (toast as any).toast({
                title: options?.title,
                description: message,
                status: 'warning',
                duration: options?.duration || 5000,
                isClosable: true,
              });
            }
          }
          console.log(`[Toast] WARNING: ${options?.title || ''} - ${message}`);
        } catch (error) {
          console.warn('Error showing warning toast:', error);
        }
      },
      info: (message: string, options?: any) => {
        try {
          if (toast) {
            // Try to use the toast in different ways
            if (typeof (toast as any).info === 'function') {
              return (toast as any).info(message, options);
            } else if (typeof (toast as any).toast === 'function') {
              return (toast as any).toast({
                title: options?.title,
                description: message,
                status: 'info',
                duration: options?.duration || 5000,
                isClosable: true,
              });
            }
          }
          console.log(`[Toast] INFO: ${options?.title || ''} - ${message}`);
        } catch (error) {
          console.warn('Error showing info toast:', error);
        }
      }
    };
    
    // Set the global toast reference when the component mounts
    ToastService.setGlobalToast(toastWrapper);
    
    // Log for debugging
    console.log('ToastService initialized with methods:', 
      Object.keys(toastWrapper));
    
    // Clean up when the component unmounts
    return () => {
      ToastService.setGlobalToast(null);
    };
  }, [toast, useFallback]);
  
  return toast;
} 