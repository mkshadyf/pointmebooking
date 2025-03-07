/**
 * Rate limiting utility
 * Provides functionality to limit the rate of operations like login attempts
 */

// Simple in-memory store for rate limiting
// In production, this should be replaced with a Redis or other distributed cache
const rateLimitStore: Record<string, { count: number, resetAt: number }> = {};

// Default rate limit settings
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export interface RateLimitOptions {
  // Maximum number of attempts allowed in the time window
  maxAttempts?: number;
  
  // Time window in milliseconds
  windowMs?: number;
  
  // Identifier for the rate limit (e.g., IP address, user ID)
  identifier: string;
}

export interface RateLimitResult {
  // Whether the operation is allowed or has been rate limited
  allowed: boolean;
  
  // Number of attempts remaining before rate limiting
  remaining: number;
  
  // When the rate limit will reset (timestamp)
  resetAt: number;
}

/**
 * Check if an operation should be rate limited
 */
export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const { 
    maxAttempts = DEFAULT_MAX_ATTEMPTS, 
    windowMs = DEFAULT_WINDOW_MS,
    identifier 
  } = options;
  
  const now = Date.now();
  
  // Initialize or get existing rate limit record
  if (!rateLimitStore[identifier] || rateLimitStore[identifier].resetAt < now) {
    rateLimitStore[identifier] = {
      count: 0,
      resetAt: now + windowMs
    };
  }
  
  // Increment attempt count
  rateLimitStore[identifier].count++;
  
  // Check if rate limited
  const isRateLimited = rateLimitStore[identifier].count > maxAttempts;
  const attemptsRemaining = Math.max(0, maxAttempts - rateLimitStore[identifier].count);
  
  return {
    allowed: !isRateLimited,
    remaining: attemptsRemaining,
    resetAt: rateLimitStore[identifier].resetAt
  };
}

/**
 * Reset the rate limit counter for a specific identifier
 */
export function resetRateLimit(identifier: string): void {
  delete rateLimitStore[identifier];
} 