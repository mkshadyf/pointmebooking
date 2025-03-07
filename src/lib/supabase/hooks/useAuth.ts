/**
 * Re-export the useAuth hook from the AuthContext
 * This file serves as a convenient entry point for importing the useAuth hook
 */

import { AuthProfile } from '@/types/database/auth';
import { useAuth } from '../auth/context/AuthContext';

// Re-export the useAuth hook
export { useAuth };

// For backward compatibility
export const useSupabaseAuth = useAuth;

// Export types
export type { AuthProfile };
