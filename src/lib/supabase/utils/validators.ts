import { Booking } from '@/types';
import { z } from 'zod';

// Common patterns
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const PHONE_PATTERN = /^\+?[\d\s-]{10,}$/;
const URL_PATTERN = /^https?:\/\/[\w-]+(\.[\w-]+)+[/#?]?.*$/i;

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
  email: z.string().email(),
  password: z.string().min(8).regex(PASSWORD_PATTERN),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  phone: z.string().regex(PHONE_PATTERN).optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(PASSWORD_PATTERN),
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

// Helper functions
export function validateEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function validatePassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}

export function validatePhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

export function validateUrl(url: string): boolean {
  return URL_PATTERN.test(url);
}

// Types
export type ApiError = z.infer<typeof ErrorSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type UpdateProfileRequest = z.infer<typeof profileSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ServiceResponse = z.infer<typeof ServiceResponseSchema>;

export const validateBooking = (data: unknown): asserts data is Booking => {
  // Implement validation logic
}; 