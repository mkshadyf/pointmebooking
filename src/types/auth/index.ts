import { Database } from '../database/generated.types';
import { UserRole, UserStatus } from '../index';

// Re-export the AuthProfile type and createAuthProfile function from profile.ts
export { createAuthProfile } from './profile';
export type { AuthProfile } from './profile';

// Base profile type directly from database
export type DbProfile = Database['public']['Tables']['profiles']['Row'];

// Auth constants
export const AUTH_CONSTANTS = {
  MAX_VERIFICATION_ATTEMPTS: 5,
  VERIFICATION_TIMEOUT_MINUTES: 30,
  PASSWORD_RESET_EXPIRY_HOURS: 24,
  MIN_PASSWORD_LENGTH: 8,
  SESSION_EXPIRY_DAYS: 7,
} as const;

/**
 * Creates a standardized AuthProfile from a database profile
 * Maps fields appropriately and provides defaults for missing fields
 * 
 * @param profile The database profile to convert
 * @returns AuthProfile with consistent types
 */
export const createAuthProfileFromDb = (profile: DbProfile) => {
  // Extract first and last name from full_name if available
  let firstName = null;
  let lastName = null;
  
  if (profile.full_name) {
    const nameParts = profile.full_name.split(' ');
    firstName = nameParts[0] || null;
    lastName = nameParts.slice(1).join(' ') || null;
  }
  
  // Create a complete AuthProfile with defaults for missing fields
  return {
    // Map existing fields from DbProfile
    id: profile.id,
    user_id: profile.user_id,
    email: profile.email,
    full_name: profile.full_name,
    first_name: firstName,
    last_name: lastName,
    // Convert role string to UserRole enum
    role: profile.role as UserRole,
    status: profile.status as UserStatus,
    avatar_url: profile.avatar_url,
    cover_image_url: profile.cover_image_url,
    phone_number: null, // No direct mapping in DB
    phone: null, // For backward compatibility
    address: null, // For backward compatibility
    created_at: profile.created_at || new Date().toISOString(),
    updated_at: profile.updated_at || new Date().toISOString(),
    onboarding_completed: profile.onboarding_completed,
    
    // Add auth-specific fields with defaults
    is_verified: true, // Default verified status
    is_email_verified: Boolean(profile.email_verified) || false,
    last_login: null, // Not stored in DB
    login_count: 0, // Not stored in DB
    failed_login_attempts: 0, // Not stored in DB
    last_failed_login: null, // Not stored in DB
    password_reset_token: null, // Not stored in DB
    password_reset_expires: null, // Not stored in DB
  };
};

// Re-export other auth types from database/auth.ts
export type {
    AuthContextType, AuthError, AuthResponse,
    AuthResult, AuthState, EmailTemplate,
    LoginCredentials
} from '../database/auth';

