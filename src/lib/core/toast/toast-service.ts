// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Global reference to toast
let globalToast: any = null;

/**
 * Toast Service for displaying notifications
 * Can be used both inside and outside of React components
 */
export class ToastService {
  /**
   * Set the global toast reference
   * This should be called from a React component that has access to the toast hook
   */
  static setGlobalToast(toast: any) {
    globalToast = toast;
  }

  /**
   * Show a success toast
   */
  static success(message: string, options?: ToastOptions) {
    return showToast('success', message, options);
  }

  /**
   * Show an error toast
   */
  static error(message: string, options?: ToastOptions) {
    return showToast('error', message, options);
  }

  /**
   * Show a warning toast
   */
  static warning(message: string, options?: ToastOptions) {
    return showToast('warning', message, options);
  }

  /**
   * Show an info toast
   */
  static info(message: string, options?: ToastOptions) {
    return showToast('info', message, options);
  }
}

/**
 * Shows a toast notification of the specified type
 * Falls back to console logging if toast is not available
 */
function showToast(type: ToastType, message: string, options?: ToastOptions) {
  if (!message) {
    console.warn('Toast message is empty');
    return;
  }

  try {
    // Check if globalToast is available
    if (!globalToast) {
      console.warn('Toast service not initialized, falling back to console');
      console.log(`[Toast] ${type.toUpperCase()}: ${options?.title || ''} - ${message}`);
      
      // Try to show browser notification as fallback
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          new Notification(options?.title || type.toUpperCase(), { body: message });
        }
      } catch (notificationError) {
        // Ignore notification errors
      }
      return;
    }

    // Try to use the specific toast type method
    if (typeof globalToast[type] === 'function') {
      globalToast[type](message, options);
      return;
    }
    
    // Try to use a generic toast method
    if (typeof globalToast.toast === 'function') {
      globalToast.toast({ 
        title: options?.title, 
        description: message, 
        status: type 
      });
      return;
    }
    
    // Try to use a show method
    if (typeof globalToast.show === 'function') {
      globalToast.show(message, { ...options, type });
      return;
    }
    
    // Last resort: log to console
    console.log(`[Toast] ${type.toUpperCase()}: ${options?.title || ''} - ${message}`);
  } catch (error) {
    console.warn('Error showing toast:', error);
    console.log(`[Toast] ${type.toUpperCase()}: ${options?.title || ''} - ${message}`);
  }
} 