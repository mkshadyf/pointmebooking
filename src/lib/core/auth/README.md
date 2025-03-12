# Authentication Service

## Important Notice: Auth Service Consolidation

> **REMOVED**: The simplified auth service (`auth-service.ts`) has been removed. Please use the comprehensive auth service from `@/lib/supabase/services/auth/auth.service.ts` instead.

This directory now contains only a compatibility layer that re-exports the comprehensive auth service. All functionality has been moved to the comprehensive auth service.

## Migration Guide

### For Component Usage

**Old approach (no longer available):**
```tsx
import { useAuthService } from '@/hooks/auth/useAuthService';

function LoginForm() {
  const { signInWithEmail, isLoading } = useAuthService();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signInWithEmail(email, password);
  };
  
  return (
    // ...
  );
}
```

**New approach (recommended):**
```tsx
import { useAuth } from '@/hooks/auth/useAuth';

function LoginForm() {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };
  
  return (
    // ...
  );
}
```

### For Direct Service Usage

**Old approach (no longer available):**
```tsx
import { AuthService } from '@/lib/core/auth/auth-service';

// Usage
await AuthService.signInWithEmail(email, password);
```

**New approach (recommended):**
```tsx
import { authService } from '@/lib/supabase/services/auth/auth.service';

// Usage
await authService.login({ email, password });
```

**Compatibility layer (temporary):**
```tsx
import { AuthService } from '@/lib/core/auth';

// Usage - this still works but is deprecated
await AuthService.signInWithEmail(email, password);
```

## Method Mapping

| Old Method (AuthService) | New Method (authService) |
|--------------------------------|--------------------------------|
| `signInWithEmail(email, password)` | `login({ email, password })` |
| `signUpWithEmail(email, password)` | `register({ email, password, role })` |
| `signInWithGoogle()` | `signInWithOAuth('google')` |
| `signOut()` | `logout()` |
| `resetPassword(email)` | `resetPassword(email)` |

## Features in Comprehensive Auth Service

The comprehensive auth service provides extensive functionality:

1. **Profile Management**
   - `getProfile()` - Get the user profile
   - `updateProfile(data)` - Update the user profile

2. **Session Management**
   - `getSession()` - Get the current session
   - `refreshSession()` - Refresh the session
   - `verifySessionIntegrity()` - Verify session integrity

3. **Advanced Authentication**
   - `verifyEmail(code)` - Verify email
   - `resendVerification()` - Resend verification email
   - `updatePassword(newPassword)` - Update password
   - `verifyOTP(params)` - Verify OTP for 2FA

4. **OAuth Providers**
   - `signInWithOAuth(provider, options)` - Sign in with various OAuth providers

## Implementation Details

The compatibility layer in this directory now simply re-exports the comprehensive auth service, ensuring backward compatibility while encouraging migration to the new service directly.

## Future Plans

In a future release, this compatibility layer will also be removed. All code should migrate to importing the comprehensive auth service directly from `@/lib/supabase/services/auth/auth.service.ts`. 