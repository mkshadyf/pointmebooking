# Authentication Service

## Important Notice: Auth Service Consolidation

> **DEPRECATED**: The simplified auth service (`auth-service.ts`) is deprecated and will be removed in a future version. Please use the comprehensive auth service from `@/lib/supabase/services/auth/auth.service.ts` instead.

This directory contains a compatibility layer for the authentication service that forwards calls to the comprehensive auth service. This approach allows for a gradual migration without breaking existing code.

## Migration Guide

### For Component Usage

**Old approach (deprecated):**
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

**Old approach (deprecated):**
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

## Method Mapping

| Deprecated Method (AuthService) | Recommended Method (authService) |
|--------------------------------|--------------------------------|
| `signInWithEmail(email, password)` | `login({ email, password })` |
| `signUpWithEmail(email, password)` | `register({ email, password, role })` |
| `signInWithGoogle()` | `signInWithOAuth('google')` |
| `signOut()` | `logout()` |
| `resetPassword(email)` | `resetPassword(email)` |

## Additional Features in Comprehensive Auth Service

The comprehensive auth service provides additional functionality not available in the simplified version:

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

The simplified auth service now forwards all calls to the comprehensive auth service, ensuring backward compatibility while encouraging migration to the new service.

## Future Plans

In a future release, the simplified auth service will be fully removed. All code should migrate to using the comprehensive auth service directly. 