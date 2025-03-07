/**
 * CSRF Protection Utility
 * 
 * This module provides functions for generating and validating CSRF tokens
 * to protect against Cross-Site Request Forgery attacks.
 */

import { createHash, randomBytes } from 'crypto';

// Constants
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_TOKEN_LENGTH = 32; // bytes
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Interface for CSRF token data
 */
interface CSRFToken {
  token: string;
  expires: number;
}

/**
 * Generate a cryptographically secure random token
 * @returns A random token string
 */
function generateRandomToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create a hash of the token for storage comparison
 * @param token - The token to hash
 * @returns Hashed token
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a new CSRF token
 * @returns CSRF token object with token and expiration
 */
export function generateCSRFToken(): CSRFToken {
  const token = generateRandomToken();
  const expires = Date.now() + CSRF_TOKEN_EXPIRY;
  
  return {
    token,
    expires
  };
}

/**
 * Set the CSRF token as a cookie
 * @param token - The CSRF token object
 */
export function setCSRFCookie(token: CSRFToken): void {
  if (typeof document === 'undefined') return;
  
  // Set the cookie with the hashed token
  const hashedToken = hashToken(token.token);
  const expires = new Date(token.expires).toUTCString();
  
  document.cookie = `${CSRF_COOKIE_NAME}=${hashedToken}; expires=${expires}; path=/; SameSite=Strict; HttpOnly`;
}

/**
 * Get the CSRF token from cookies
 * @returns The hashed CSRF token or null if not found
 */
export function getCSRFCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return value;
    }
  }
  
  return null;
}

/**
 * Validate a CSRF token against the stored token
 * @param token - The token to validate
 * @returns Whether the token is valid
 */
export function validateCSRFToken(token: string): boolean {
  if (!token) return false;
  
  const storedToken = getCSRFCookie();
  if (!storedToken) return false;
  
  // Hash the provided token and compare with the stored hashed token
  const hashedToken = hashToken(token);
  return hashedToken === storedToken;
}

/**
 * Get the CSRF header name for use in API requests
 * @returns The CSRF header name
 */
export function getCSRFHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Add CSRF token to a fetch request
 * @param options - Fetch request options
 * @param token - CSRF token to include
 * @returns Updated fetch options with CSRF token
 */
export function addCSRFToken(options: RequestInit = {}, token: string): RequestInit {
  const headers = {
    ...options.headers,
    [CSRF_HEADER_NAME]: token
  };
  
  return {
    ...options,
    headers
  };
}

/**
 * Create middleware for validating CSRF tokens in API routes
 * @returns Middleware function for Next.js API routes
 */
export function csrfProtection() {
  return (req: any, res: any, next: () => void) => {
    // Skip for GET, HEAD, OPTIONS requests as they should be idempotent
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    const token = req.headers[CSRF_HEADER_NAME.toLowerCase()];
    
    if (!token || !validateCSRFToken(token)) {
      return res.status(403).json({
        error: {
          message: 'Invalid or missing CSRF token',
          code: 'security/invalid-csrf-token'
        }
      });
    }
    
    next();
  };
}

/**
 * Initialize CSRF protection for a client application
 * @returns CSRF token for use in forms and API requests
 */
export function initCSRF(): string {
  const token = generateCSRFToken();
  setCSRFCookie(token);
  return token.token;
}

/**
 * Refresh the CSRF token
 * @returns New CSRF token
 */
export function refreshCSRFToken(): string {
  return initCSRF();
} 