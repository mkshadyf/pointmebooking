import { z } from 'zod';

// Regex patterns for validation
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
const URL_PATTERN = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Basic schemas
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email cannot exceed 255 characters');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters')
  .regex(PASSWORD_PATTERN, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const phoneSchema = z.string()
  .regex(PHONE_PATTERN, 'Invalid phone number')
  .optional()
  .or(z.literal(''));

export const urlSchema = z.string()
  .regex(URL_PATTERN, 'Invalid URL')
  .optional()
  .or(z.literal(''));

// Auth form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  phone: phoneSchema,
  role: z.enum(['customer', 'business']),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Profile schemas
export const basicProfileSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema,
  avatar_url: urlSchema
});

export const businessProfileSchema = basicProfileSchema.extend({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_type: z.string().min(2, 'Business type must be at least 2 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  website: urlSchema
});

// Service schema
export const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
  price: z.number().min(0, 'Price cannot be negative'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes'),
  category_id: z.string().optional().nullable(),
  is_available: z.boolean().default(true),
  image_url: urlSchema.nullable(),
  max_capacity: z.number().min(1, 'Capacity must be at least 1').optional().nullable(),
  location: z.string().optional().nullable()
});

// Booking schema
export const bookingSchema = z.object({
  service_id: z.string(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

// Exported types
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type BasicProfileFormValues = z.infer<typeof basicProfileSchema>;
export type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;
export type ServiceFormValues = z.infer<typeof serviceSchema>;
export type BookingFormValues = z.infer<typeof bookingSchema>; 