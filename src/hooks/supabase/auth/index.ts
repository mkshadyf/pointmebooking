/**
 * @deprecated This module is deprecated. Import from '@/hooks/auth' instead.
 * This will be removed in a future version.
 */

// Import the root useAuth hook with a different name to avoid conflicts
import { useAuth as RootUseAuth } from '@/hooks/auth';

/**
 * @deprecated Use useAuth from '@/hooks/auth' instead.
 * This hook will be removed in a future version.
 */
export function useAuth(options = {}) {
  console.warn(
    'useAuth from @/hooks/supabase/auth is deprecated. ' +
    'Please use useAuth from @/hooks/auth instead. ' +
    'This hook will be removed in a future version.'
  );
  
  return RootUseAuth(options);
}

// Export the useAuth hook as the default export
export default useAuth; 