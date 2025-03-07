import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Common patterns
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
export const PHONE_PATTERN = /^\+?[\d\s-]{10,}$/;
export const URL_PATTERN = /^https?:\/\/[\w-]+(\.[\w-]+)+[/#?]?.*$/i;

/**
 * Combines multiple class values into a single string.
 * Uses clsx for conditional classes and twMerge to handle Tailwind CSS conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Date and time formatting
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Text manipulation
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function isValidPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}

export function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

export function isValidUrl(url: string): boolean {
  return URL_PATTERN.test(url);
}

// Utility functions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Cookie helpers
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : undefined;
}

export function setCookie(name: string, value: string, options: {
  path?: string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
} = {}): void {
  if (typeof document === 'undefined') return;
  const {
    path = '/',
    maxAge = 30 * 24 * 60 * 60, // 30 days
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
  } = options;

  document.cookie = `${name}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}${
    secure ? '; secure' : ''
  }; samesite=${sameSite}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter((cls): cls is string => Boolean(cls)).join(' ');
}
