import { useCallback, useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

interface Toast {
  id: string;
  title?: string;
  description: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Global store for toasts
let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const DEFAULT_DURATION = 5000;

function emitChange() {
  listeners.forEach((listener) => listener(toasts));
}

/**
 * Hook for displaying toast notifications
 */
export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter((listener) => listener !== setCurrentToasts);
    };
  }, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2);
    const newToast = { ...toast, id };
    toasts = [...toasts, newToast];
    emitChange();

    // Auto dismiss
    if (toast.duration !== 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration || DEFAULT_DURATION);
    }

    return id;
  };

  const dismissToast = (id: string) => {
    toasts = toasts.filter((toast) => toast.id !== id);
    emitChange();
  };

  const toast = {
    success: (description: string, options?: Partial<Toast>) =>
      addToast({ description, type: 'success', ...options }),
    error: (description: string, options?: Partial<Toast>) =>
      addToast({ description, type: 'error', ...options }),
    warning: (description: string, options?: Partial<Toast>) =>
      addToast({ description, type: 'warning', ...options }),
    info: (description: string, options?: Partial<Toast>) =>
      addToast({ description, type: 'info', ...options }),
    custom: (options: Omit<Toast, 'id'>) => addToast(options),
    dismiss: dismissToast,
  };

  /**
   * Show a toast notification
   */
  const showToast = useCallback(({ type, message, duration = 5000 }: ToastOptions) => {
    switch (type) {
      case 'success':
        return toast.success(message, { duration });
      case 'error':
        return toast.error(message, { duration });
      case 'warning':
        return toast.warning(message, { duration });
      case 'info':
        return toast.info(message, { duration });
      default:
        return toast.info(message, { duration });
    }
  }, []);

  return {
    toast,
    toasts: currentToasts,
    dismiss: dismissToast,
    showToast
  };
} 