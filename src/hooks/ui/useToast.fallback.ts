import { useCallback, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  options?: ToastOptions;
}

/**
 * Fallback implementation of the useToast hook
 * This can be used if the original useToast hook is not working properly
 */
export function useToastFallback() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { id, type, message, options };
    
    setToasts(prev => [...prev, toast]);
    
    // Log for debugging
    console.log(`[Toast] ${type.toUpperCase()}: ${options?.title || ''} - ${message}`);
    
    // Remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, options?.duration || 3000);
    
    return id;
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  return {
    toasts,
    success: (message: string, options?: ToastOptions) => addToast('success', message, options),
    error: (message: string, options?: ToastOptions) => addToast('error', message, options),
    warning: (message: string, options?: ToastOptions) => addToast('warning', message, options),
    info: (message: string, options?: ToastOptions) => addToast('info', message, options),
    remove: removeToast,
  };
} 