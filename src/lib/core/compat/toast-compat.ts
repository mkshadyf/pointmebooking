/**
 * Compatibility layer for the toast service
 * 
 * This file provides backward compatibility with the old toast implementations
 * to ease the transition to the new core services.
 */

import { ToastOptions, ToastService, ToastType } from '../toast';

// Map legacy toast types to new types
const typeMap: Record<string, ToastType> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  default: 'info',
};

/**
 * Legacy toast function for backward compatibility
 * @deprecated Use ToastService directly instead
 */
export function toast(type: string, message: string, options?: any) {
  // Map legacy type to new type
  const mappedType = typeMap[type] || 'info';
  
  // Map legacy options to new options
  const toastOptions: ToastOptions = {
    title: options?.title,
    duration: options?.duration,
    action: options?.action ? {
      label: options.action.text,
      onClick: options.action.onClick,
    } : undefined,
  };
  
  // Call the appropriate method on ToastService
  switch (mappedType) {
    case 'success':
      ToastService.success(message, toastOptions);
      break;
    case 'error':
      ToastService.error(message, toastOptions);
      break;
    case 'warning':
      ToastService.warning(message, toastOptions);
      break;
    case 'info':
    default:
      ToastService.info(message, toastOptions);
      break;
  }
}

/**
 * Legacy success toast for backward compatibility
 * @deprecated Use ToastService.success directly instead
 */
export function showSuccessToast(message: string, title?: string, duration?: number) {
  ToastService.success(message, { title, duration });
}

/**
 * Legacy error toast for backward compatibility
 * @deprecated Use ToastService.error directly instead
 */
export function showErrorToast(message: string, title?: string, duration?: number) {
  ToastService.error(message, { title, duration });
}

/**
 * Legacy warning toast for backward compatibility
 * @deprecated Use ToastService.warning directly instead
 */
export function showWarningToast(message: string, title?: string, duration?: number) {
  ToastService.warning(message, { title, duration });
}

/**
 * Legacy info toast for backward compatibility
 * @deprecated Use ToastService.info directly instead
 */
export function showInfoToast(message: string, title?: string, duration?: number) {
  ToastService.info(message, { title, duration });
}

/**
 * Legacy notification toast for backward compatibility
 * @deprecated Use ToastService.info directly instead
 */
export function showNotification(message: string, title?: string, duration?: number) {
  ToastService.info(message, { title, duration });
} 