# Auth Hook Consolidation Implementation Plan

This document outlines the detailed plan for consolidating the authentication hooks and updating them to use the `authService` singleton.

## Current State Analysis

### Current Implementation
- `src/hooks/auth/useAuth.ts` - Uses the auth store for state management
- `src/hooks/supabase/auth/useAuth.ts` - Direct implementation using Supabase client
- `src/hooks/auth/useSupabaseAuth.ts` - Deprecated, redirects to useAuth
- `src/hooks/supabase/auth/useSupabaseAuth.ts` - Deprecated, redirects to its local useAuth
- `src/lib/supabase/auth/context/AuthContext.tsx` - Likely provides React context for auth state

### Issues with Current Approach
- Duplicate implementations with different internal workings
- Confusing import paths
- Inconsistent implementation (store vs. direct client)
- Potential for different behavior between implementations
- Maintenance burden of keeping multiple implementations in sync

## Implementation Plan

### Step 1: Update Root Auth Hook

Update `src/hooks/auth/useAuth.ts` to use the `authService` singleton:

```typescript
import { convertToAuthError } from '@/lib/error/auth-error-converter';
import { authService } from '@/lib/supabase/services/auth.service';
import { AuthProfile } from '@/types/auth';
import { AuthError } from '@/types/database/auth';
import { Session, User } from '@supabase/supabase-js';
import { useCallback, useState } from 'react';

/**
 * Options for the useAuth hook
 */
interface UseAuthOptions {
  redirectTo?: string;
  onAuthStateChange?: (session: Session | null) => void;
  onError?: (error: AuthError) => void;
}

/**
 * Return type for the useAuth hook
 */
interface UseAuthReturn {
  // User state
  user: User | null;
  profile: AuthProfile | null;
  session: Session | null;
  
  // Auth state
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Hook for authentication functionality
 * Provides user state and auth methods using the authService singleton
 * 
 * @param options Hook configuration options
 * @returns Authentication state and methods
 */
export function useAuth({
  redirectTo,
  onAuthStateChange,
  onError,
}: UseAuthOptions = {}): UseAuthReturn {
  // Local state for hook-specific loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const session = await authService.getSession();
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          const profile = await authService.getProfile(session.user.id);
          setProfile(profile);
        }
      } catch (err) {
        const authError = convertToAuthError(err);
        setError(authError);
        if (onError) onError(authError);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Set up auth state change listener
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        authService.getProfile(session.user.id)
          .then(profile => setProfile(profile))
          .catch(err => console.error('Error fetching profile:', err));
      } else {
        setProfile(null);
      }
      
      if (onAuthStateChange) {
        onAuthStateChange(session);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [onAuthStateChange, onError]);
  
  // Derived state
  const isAuthenticated = !!user;
  
  // Method to handle login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle registration
  const register = useCallback(async (email: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(email, password, role);
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle password reset
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle password update
  const updatePassword = useCallback(async (newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.updatePassword(newPassword);
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle email verification
  const verifyEmail = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.verifyEmail(code);
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle resending verification email
  const resendVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Implement when we have this functionality in authService
      // await authService.resendVerification();
      console.warn('resendVerification not implemented yet');
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle profile updates
  const updateProfile = useCallback(async (data: Partial<AuthProfile>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedProfile = await authService.updateProfile(data);
      setProfile(updatedProfile);
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  // Method to handle session refresh
  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await authService.refreshSession();
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        const profile = await authService.getProfile(session.user.id);
        setProfile(profile);
      }
    } catch (err) {
      const authError = convertToAuthError(err);
      setError(authError);
      if (onError) onError(authError);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);
  
  return {
    // User state
    user,
    profile,
    session,
    
    // Auth state
    isLoading,
    isAuthenticated,
    error,
    
    // Auth methods
    login,
    register,
    signOut,
    resetPassword,
    updatePassword,
    verifyEmail,
    resendVerification,
    updateProfile,
    refreshSession,
  };
}
```

### Step 2: Update Supabase Auth Hook with Deprecation Notice

Update `src/hooks/supabase/auth/useAuth.ts` to re-export from the root hook with a deprecation notice:

```typescript
/**
 * @deprecated This hook is deprecated. Use `useAuth` from '@/hooks/auth' instead.
 * This provides the same functionality with a more consistent API.
 */

import { useAuth } from '@/hooks/auth';

export * from '@/hooks/auth';

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
  
  return useAuth(options);
}

export default useAuth;
```

### Step 3: Update Auth Context

Update `src/lib/supabase/auth/context/AuthContext.tsx` to use the consolidated hook:

```typescript
import { useAuth } from '@/hooks/auth';
import { AuthProfile } from '@/types/auth';
import { AuthError } from '@/types/database/auth';
import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext } from 'react';

interface AuthContextType {
  // User state
  user: User | null;
  profile: AuthProfile | null;
  session: Session | null;
  
  // Auth state
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthProvider({ children, redirectTo }: AuthProviderProps) {
  const auth = useAuth({ redirectTo });
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}
```

### Step 4: Update Component Imports

For each component using the deprecated hooks, update imports:

#### Example: Updating ProtectedRoute.tsx

```typescript
// Before
import { useAuth } from '@/hooks/supabase/auth';

// After
import { useAuth } from '@/hooks/auth';
```

### Step 5: Create Compatibility Layer for Other Hooks

Update `src/hooks/supabase/auth/index.ts` to re-export from the root hook:

```typescript
/**
 * @deprecated This module is deprecated. Import from '@/hooks/auth' instead.
 * This will be removed in a future version.
 */

export * from '@/hooks/auth';
```

## Testing Plan

### Unit Tests
- Test the updated useAuth hook with the authService singleton
- Test all auth methods (login, register, signOut, etc.)
- Test error handling and loading states

### Integration Tests
- Test the AuthContext with the updated hook
- Test components that use the hook
- Test authentication flows end-to-end

### Component Tests
- Test ProtectedRoute and PermissionGuard components
- Test auth forms and other components that use auth state

## Migration Strategy

### Phase 1: Implementation and Internal Testing
- Update the root useAuth hook to use authService
- Add deprecation notices to other hooks
- Test thoroughly in development environment

### Phase 2: Gradual Rollout
- Update critical components one by one
- Test each component after update
- Monitor for any issues

### Phase 3: Complete Migration
- Update all remaining components
- Remove deprecated hooks
- Update documentation

## Rollback Plan

If issues are encountered:
1. Revert to the original implementation temporarily
2. Fix issues in the updated hook
3. Try again with the fixed implementation

## Success Criteria

- All components use the consolidated hook from '@/hooks/auth'
- No direct imports of deprecated hooks
- Consistent behavior across all components
- No regression in functionality
- Improved maintainability and reduced code duplication 