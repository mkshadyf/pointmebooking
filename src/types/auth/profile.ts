import { Database } from '../database/generated.types';
import { UserRole, UserStatus } from '../index';

// Base profile type directly from database
type DbProfile = Database['public']['Tables']['profiles']['Row'];

/**
 * Standardized AuthProfile type
 * This is the single source of truth for the auth profile structure
 * Used across the entire application for consistency
 */
export interface AuthProfile {
  // Base profile fields (from database)
  id: string;
  user_id: string;
  email: string;
  full_name: string | null; // Use full_name
  first_name?: string | null; // For backward compatibility
  last_name?: string | null; // For backward compatibility
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  cover_image_url?: string | null;
  phone_number: string | null; // Use phone_number
  phone?: string | null; // For backward compatibility
  address?: string | null; // For backward compatibility
  created_at: string;
  updated_at: string;
  onboarding_completed?: boolean | null;
  
  // Auth-specific fields not stored in database
  is_verified: boolean;
  is_email_verified: boolean;
  last_login: string | null;
  login_count: number;
  failed_login_attempts: number;
  last_failed_login: string | null;
  password_reset_token: string | null;
  password_reset_expires: string | null;
}

/**
 * Creates a standardized AuthProfile from a database profile
 * Maps fields appropriately and provides defaults for missing fields
 * 
 * @param profile The database profile to convert
 * @returns AuthProfile with consistent types
 */
export const createAuthProfile = (profile: DbProfile): AuthProfile => {
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
    full_name: profile.full_name, // Use full_name
    first_name: firstName, // Add first_name for backward compatibility
    last_name: lastName, // Add last_name for backward compatibility
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