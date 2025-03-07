/**
 * Password Strength Meter Utility
 * 
 * This module provides functionality for measuring password strength
 * and providing visual feedback to users.
 */

import { PASSWORD_RULES } from '@/lib/supabase/utils/validators';

/**
 * Password strength levels
 */
export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  MEDIUM = 2,
  STRONG = 3,
  VERY_STRONG = 4
}

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  score: PasswordStrength;
  feedback: string[];
  color: string;
  label: string;
  meetsRequirements: boolean;
}

/**
 * Calculate password strength score
 * @param password - The password to evaluate
 * @returns Password strength score (0-4)
 */
function calculatePasswordScore(password: string): PasswordStrength {
  if (!password) return PasswordStrength.VERY_WEAK;
  
  let score = 0;
  
  // Length check
  if (password.length >= PASSWORD_RULES.MIN_LENGTH) {
    score += 1;
  }
  
  if (password.length >= PASSWORD_RULES.MIN_LENGTH + 4) {
    score += 1;
  }
  
  // Character variety checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // Add points for character variety
  const varietyScore = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars]
    .filter((check): check is boolean => Boolean(check)).length;
  
  score += varietyScore > 2 ? 2 : varietyScore;
  
  // Check for common patterns
  const hasRepeatedChars = /(.)\1{2,}/.test(password); // e.g., 'aaa'
  const hasSequentialChars = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  const hasCommonWords = /(?:password|qwerty|admin|welcome|letmein|monkey|abc123|123456)/i.test(password);
  
  // Deduct points for common patterns
  if (hasRepeatedChars || hasSequentialChars || hasCommonWords) {
    score = Math.max(0, score - 1);
  }
  
  return score as PasswordStrength;
}

/**
 * Get feedback based on password strength
 * @param password - The password to evaluate
 * @returns Array of feedback messages
 */
function getPasswordFeedback(password: string): string[] {
  const feedback: string[] = [];
  
  // Length check
  if (!password || password.length < PASSWORD_RULES.MIN_LENGTH) {
    feedback.push(`Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long`);
  }
  
  // Character variety checks
  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_RULES.REQUIRE_NUMBER && !/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  }
  
  if (PASSWORD_RULES.REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  }
  
  // Pattern checks
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Password contains repeated characters');
  }
  
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    feedback.push('Password contains sequential characters');
  }
  
  if (/(?:password|qwerty|admin|welcome|letmein|monkey|abc123|123456)/i.test(password)) {
    feedback.push('Password contains common words or patterns');
  }
  
  return feedback;
}

/**
 * Check if password meets minimum requirements
 * @param password - The password to check
 * @returns Whether the password meets minimum requirements
 */
function meetsMinimumRequirements(password: string): boolean {
  if (!password || password.length < PASSWORD_RULES.MIN_LENGTH) {
    return false;
  }
  
  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return false;
  }
  
  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return false;
  }
  
  if (PASSWORD_RULES.REQUIRE_NUMBER && !/\d/.test(password)) {
    return false;
  }
  
  if (PASSWORD_RULES.REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false;
  }
  
  return true;
}

/**
 * Get color for password strength
 * @param score - Password strength score
 * @returns Color code
 */
function getStrengthColor(score: PasswordStrength): string {
  switch (score) {
    case PasswordStrength.VERY_WEAK:
      return '#ff4d4f'; // Red
    case PasswordStrength.WEAK:
      return '#faad14'; // Orange
    case PasswordStrength.MEDIUM:
      return '#fadb14'; // Yellow
    case PasswordStrength.STRONG:
      return '#52c41a'; // Light Green
    case PasswordStrength.VERY_STRONG:
      return '#389e0d'; // Dark Green
    default:
      return '#ff4d4f'; // Red
  }
}

/**
 * Get label for password strength
 * @param score - Password strength score
 * @returns Descriptive label
 */
function getStrengthLabel(score: PasswordStrength): string {
  switch (score) {
    case PasswordStrength.VERY_WEAK:
      return 'Very Weak';
    case PasswordStrength.WEAK:
      return 'Weak';
    case PasswordStrength.MEDIUM:
      return 'Medium';
    case PasswordStrength.STRONG:
      return 'Strong';
    case PasswordStrength.VERY_STRONG:
      return 'Very Strong';
    default:
      return 'Very Weak';
  }
}

/**
 * Evaluate password strength
 * @param password - The password to evaluate
 * @returns Password strength result
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const score = calculatePasswordScore(password);
  const feedback = getPasswordFeedback(password);
  const color = getStrengthColor(score);
  const label = getStrengthLabel(score);
  const meetsRequirements = meetsMinimumRequirements(password);
  
  return {
    score,
    feedback,
    color,
    label,
    meetsRequirements
  };
}

/**
 * Get percentage for password strength meter
 * @param score - Password strength score
 * @returns Percentage (0-100)
 */
export function getStrengthPercentage(score: PasswordStrength): number {
  return (score / 4) * 100;
} 