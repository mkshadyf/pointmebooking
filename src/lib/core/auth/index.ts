/**
 * Authentication service compatibility layer
 * @deprecated This module will be removed on 2024-10-01. Import directly from '@/lib/supabase/services/auth/auth.service.ts' instead.
 * See AUTH_COMPAT_REMOVAL_PLAN.md for details on the removal timeline.
 */

// Re-export the comprehensive auth service for backward compatibility
export { authService as AuthService, AuthService as AuthServiceClass } from '@/lib/supabase/services/auth/auth.service';

// Re-export types for backward compatibility
export type { AuthProfile, AuthResponse } from '@/types/database/auth';

// Log a warning when this module is imported
console.warn(
  'The auth compatibility layer from @/lib/core/auth is deprecated and will be removed on 2024-10-01. ' +
  'Import directly from @/lib/supabase/services/auth/auth.service.ts instead. ' +
  'See AUTH_COMPAT_REMOVAL_PLAN.md for details.'
);

