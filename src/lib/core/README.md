# Core Services

This directory contains core services for the application, providing centralized functionality for common operations.

## Services

### Error Service

The Error Service (`/error/error-service.ts`) provides centralized error handling functionality:

- `handleError`: Logs errors and optionally displays toast notifications
- `createError`: Creates standardized error objects
- `normalizeError`: Converts any error type to a standard Error object

### Toast Service

The Toast Service (`/toast/toast-service.ts`) provides a global toast notification system:

- Works both inside and outside of React components
- Provides methods for different toast types: success, error, warning, info
- Includes fallbacks for non-React contexts

### Auth Service

The Auth Service (`/auth/auth-service.ts`) centralizes authentication operations:

- Provides methods for common auth operations: sign in, sign up, sign out, etc.
- Handles error processing and user feedback
- Returns standardized result objects

## Integration with React

### Toast Integration

1. Use the `ToastProvider` component in your app's root layout
2. The provider initializes the global toast service using the `useToastService` hook
3. This allows the toast service to be used anywhere in the application

### Auth Integration

1. Use the `useAuthService` hook in your components
2. The hook provides methods for authentication operations with loading state management
3. Loading states are automatically managed through the auth state store

## Example Usage

### Using the Toast Service

```typescript
import { ToastService } from '@/lib/core/toast';

// Show a success toast
ToastService.toast.success('Operation completed successfully');

// Show an error toast with options
ToastService.toast.error('Something went wrong', {
  title: 'Error',
  duration: 5000
});
```

### Using the Auth Service

```typescript
import { useAuthService } from '@/hooks/auth/useAuthService';

function LoginForm() {
  const authService = useAuthService();
  
  const handleLogin = async (email, password) => {
    const result = await authService.signInWithEmail(email, password);
    
    if (result.success) {
      // Handle successful login
    } else {
      // Handle login failure
    }
  };
  
  return (
    <form onSubmit={...}>
      {/* Form fields */}
      <button type="submit" disabled={authService.isLoading}>
        Sign In
      </button>
    </form>
  );
}
```

### Using the Error Service

```typescript
import { ErrorService } from '@/lib/core/error';

try {
  // Some operation that might fail
} catch (error) {
  ErrorService.handleError(error, {
    context: 'Data Fetching',
    additionalData: { userId: '123' }
  });
}
```

## Migration from Legacy Systems

This module replaces several older systems:

- `src/lib/auth/authFeedback.ts` → `src/lib/core/auth`
- `src/lib/error/error-logger.ts` → `src/lib/core/error`
- Various toast implementations → `src/lib/core/toast`

### Compatibility Layer

To ease the transition, a compatibility layer is provided:

```typescript
import { compat } from '@/lib/core';

// Instead of importing from old modules:
// import { withAuthFeedback } from '@/lib/auth/authFeedback';
// import { logError } from '@/lib/error/error-logger';

// Use the compatibility layer:
compat.withAuthFeedback(...);
compat.logError(...);
compat.showToast(...);
```

### Migration Helper

A migration helper script is available to identify files that need to be updated:

```bash
npx ts-node src/lib/core/scripts/migration-helper.ts
```

See the [Migration Plan](./MIGRATION_PLAN.md) for detailed steps on transitioning to the new core services. 