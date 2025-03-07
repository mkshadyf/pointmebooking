/**
 * Security Headers Utility
 * 
 * This module provides functions for implementing security headers
 * to protect against various web vulnerabilities.
 */

/**
 * Content Security Policy directives
 * Customize these based on your application's needs
 */
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https://*'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://*.supabase.co'],
  'frame-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'upgrade-insecure-requests': []
};

/**
 * Generate a Content Security Policy header value
 * @returns CSP header value
 */
function generateCSP(): string {
  return Object.entries(cspDirectives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Security headers for Next.js
 * @returns Object with security headers
 */
export function securityHeaders(): Record<string, string> {
  return {
    // Content Security Policy
    'Content-Security-Policy': generateCSP(),
    
    // Prevent browsers from incorrectly detecting non-scripts as scripts
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',
    
    // Only send the origin as referrer
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Enforce HTTPS
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    
    // Control browser features
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    
    // Prevent MIME type sniffing
    'X-Download-Options': 'noopen',
    
    // Disable DNS prefetching
    'X-DNS-Prefetch-Control': 'off'
  };
}

/**
 * Apply security headers to a response object
 * @param res - Response object
 */
export function applySecurityHeaders(res: any): void {
  const headers = securityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

/**
 * Create middleware for applying security headers
 * @returns Middleware function
 */
export function securityHeadersMiddleware() {
  return (_req: any, res: any, next: () => void) => {
    applySecurityHeaders(res);
    next();
  };
}

/**
 * Get security headers for Next.js config
 * @returns Next.js headers configuration
 */
export function getNextSecurityHeaders() {
  return [
    {
      // Apply these headers to all routes
      source: '/:path*',
      headers: Object.entries(securityHeaders()).map(([key, value]) => ({
        key,
        value
      }))
    }
  ];
}

/**
 * Generate a nonce for CSP
 * @returns Random nonce string
 */
export function generateNonce(): string {
  return Buffer.from(Math.random().toString(36).substring(2, 15)).toString('base64');
}

/**
 * Update CSP with a nonce for scripts
 * @param nonce - The nonce to use
 * @returns Updated CSP header value
 */
export function generateCSPWithNonce(nonce: string): string {
  const updatedDirectives = { ...cspDirectives };
  updatedDirectives['script-src'] = [...updatedDirectives['script-src'], `'nonce-${nonce}'`];
  
  return Object.entries(updatedDirectives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply security headers with a nonce to a response object
 * @param res - Response object
 * @param nonce - The nonce to use
 */
export function applySecurityHeadersWithNonce(res: any, nonce: string): void {
  const headers = securityHeaders();
  headers['Content-Security-Policy'] = generateCSPWithNonce(nonce);
  
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
} 