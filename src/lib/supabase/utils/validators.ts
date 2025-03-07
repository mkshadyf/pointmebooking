import { Booking } from '@/types';
import { z } from 'zod';

// Common patterns
// Enhanced password pattern requiring at least one lowercase, one uppercase, one digit, one special character, and minimum 10 characters
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{10,}$/;
const PHONE_PATTERN = /^\+?[\d\s-]{10,}$/;
const URL_PATTERN = /^https?:\/\/[\w-]+(\.[\w-]+)+[/#?]?.*$/i;

/**
 * Password validation rules
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 10,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  MAX_LENGTH: 100,
};

// Base schemas
export const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(10, "Password must be at least 10 characters long")
    .regex(
      PASSWORD_PATTERN, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  phone: z.string().regex(PHONE_PATTERN, "Please enter a valid phone number").optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string()
    .min(10, "Password must be at least 10 characters long")
    .regex(
      PASSWORD_PATTERN, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

// Profile schemas
export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(PHONE_PATTERN).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export const businessProfileSchema = profileSchema.extend({
  businessName: z.string().min(2),
  businessDescription: z.string().max(1000),
  website: z.string().regex(URL_PATTERN).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

// Service schemas
export const serviceSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  duration: z.number().min(15),
  categoryId: z.string().uuid(),
  businessId: z.string().uuid(),
  images: z.array(z.string().url()).optional(),
});

// Booking schemas
export const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().datetime(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
  notes: z.string().max(500).optional(),
});

// Response schemas
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['user', 'business', 'admin']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ServiceResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  categoryId: z.string().uuid(),
  businessId: z.string().uuid(),
  images: z.array(z.string().url()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  business: z.object({
    id: z.string().uuid(),
    name: z.string(),
    avatar: z.string().url().optional(),
  }).optional(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    icon: z.string().optional(),
  }).optional(),
});

// Types
export type ApiError = z.infer<typeof ErrorSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type UpdateProfileRequest = z.infer<typeof profileSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ServiceResponse = z.infer<typeof ServiceResponseSchema>;

export const validateBooking = (data: Booking): void => {
  // Implement validation logic
};

/**
 * Validates a password against security requirements
 * @param password - The password to validate
 * @returns An object with validation result and any error messages
 */
export function validatePassword(password: string): { 
  valid: boolean; 
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check password length
  if (!password || password.length < PASSWORD_RULES.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long`);
  }
  
  if (password && password.length > PASSWORD_RULES.MAX_LENGTH) {
    errors.push(`Password cannot exceed ${PASSWORD_RULES.MAX_LENGTH} characters`);
  }
  
  // Check for uppercase letters
  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (PASSWORD_RULES.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (PASSWORD_RULES.REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates an email address format
 * @param email - The email to validate
 * @returns Whether the email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a username
 * @param username - The username to validate
 * @returns An object with validation result and any error messages
 */
export function validateUsername(username: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username && username.length > 30) {
    errors.push('Username cannot exceed 30 characters');
  }
  
  // Only allow alphanumeric characters, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a phone number format
 * @param phone - The phone number to validate
 * @returns Whether the phone number is valid
 */
export function validatePhone(phone: string): boolean {
  // Basic phone validation - would need to be adjusted for international formats
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates a URL format
 * @param url - The URL to validate
 * @returns Whether the URL is valid
 */
export function validateUrl(url: string): boolean {
  return URL_PATTERN.test(url);
} 