# Authentication System

This document provides an overview of the authentication system in the PointMe application.

## Architecture

The authentication system follows a singleton pattern with the following components:

1. **AuthService**: A singleton service that handles all authentication operations
   - Located at `src/lib/supabase/services/auth/auth.service.ts`
   - Provides methods for login, registration, profile management, etc.
   - Uses the SupabaseClientService for all Supabase operations

2. **SupabaseClientService**: A singleton service that manages Supabase client instances
   - Located at `src/lib/supabase/services/core/supabase-client.service.ts`
   - Provides methods for getting browser and server clients
   - Handles retry logic and error handling

3. **useAuth Hook**: A React hook that provides authentication state and methods
   - Located at `src/hooks/auth/useAuth.ts`
   - Uses the AuthService singleton for all operations
   - Manages local state for user, profile, session, etc.

## Recent Fixes

The following issues have been fixed:

1. **Import Path Correction**: Fixed the import path for authService in the useAuth hook
   - Changed from `@/lib/supabase/services/auth.service` to `@/lib/supabase/services/auth/auth.service`

2. **Type Compatibility**: Fixed type compatibility issues between different AuthProfile types
   - Created a utility function `safelyConvertProfile` to handle type conversion
   - Properly handles null/undefined values

3. **Auth State Change Handling**: Improved the handling of auth state changes
   - Added robust type checking for subscription objects
   - Fixed unsubscribe function to prevent memory leaks

4. **Profile Update**: Fixed the profile update method to handle partial updates correctly
   - Uses conditional spreading to only include defined properties
   - Properly converts between app and database profile formats

## Usage Examples

### Login

```tsx
import { authService } from '@/lib/supabase/services/auth/auth.service';

async function handleLogin(email: string, password: string) {
  const { data, error } = await authService.login({
    email,
    password,
  });
  
  if (error) {
    // Handle error
    return;
  }
  
  // User is logged in, session is in data
}
```

### Registration

```tsx
import { authService } from '@/lib/supabase/services/auth/auth.service';

async function handleRegister(email: string, password: string, role: string) {
  const { data, error } = await authService.register({
    email,
    password,
    role,
  });
  
  if (error) {
    // Handle error
    return;
  }
  
  // User is registered, session is in data
}
```

### Using the useAuth Hook

```tsx
import { useAuth } from '@/hooks/auth/useAuth';

function MyComponent() {
  const { 
    user, 
    profile, 
    isAuthenticated, 
    login, 
    register, 
    signOut 
  } = useAuth();
  
  // Use the auth state and methods
}
```

## OAuth Authentication

For OAuth authentication (Google, etc.), we need to use the Supabase client directly:

```tsx
import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';

async function handleGoogleSignIn() {
  const client = await supabaseClientService.getBrowserClient();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    // Handle error
  }
}
``` 