/**
 * Entity Constants
 * 
 * This file contains constants related to the various entities in the application.
 * These include roles, statuses, and other enumerated values used across the app.
 */

// User roles allowed in the system
export const USER_ROLES = ['customer', 'business', 'admin', 'staff'] as const;

// User status values
export const USER_STATUSES = ['active', 'inactive', 'suspended', 'pending'] as const;

// Booking status values
export const BOOKING_STATUSES = [
  'pending', 
  'confirmed', 
  'cancelled', 
  'completed',
  'no-show',
  'rescheduled',
  'in-progress'
] as const;

// Service status values 
export const SERVICE_STATUSES = ['active', 'inactive', 'draft', 'archived'] as const;

// Approval status values for moderation flows
export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;

// Derived types from constants
export type UserRole = typeof USER_ROLES[number];
export type UserStatus = typeof USER_STATUSES[number]; 
export type BookingStatus = typeof BOOKING_STATUSES[number];
export type ServiceStatus = typeof SERVICE_STATUSES[number];
export type ApprovalStatus = typeof APPROVAL_STATUSES[number]; 