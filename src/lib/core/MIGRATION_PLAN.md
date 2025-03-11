# Migration Plan: Transitioning to Core Services

This document outlines the steps needed to transition from the existing error handling, toast notifications, and authentication feedback systems to the new centralized core services.

## 1. Update Auth Components

### AuthLoadingOverlay Component
- Update import from `useAuthState` from old location to new hook
- Replace with: `import { useAuthService } from '@/hooks/auth/useAuthService';`

### Auth Pages (login, register, reset-password, etc.)
- Replace `withAuthFeedback` with the new `useAuthService` hook
- Update form submission handlers to use the new auth service methods

## 2. Update Error Handling

### Files using `logError` from error-logger
- Replace imports: `import { logError } from '@/lib/error/error-logger';`
- With: `import { ErrorService } from '@/lib/core/error';`
- Replace function calls: `logError(error, context);`
- With: `ErrorService.handleError(error, { context });`

### Error Boundary Component
- Update to use the new ErrorService for logging errors

## 3. Update Toast Usage

### Components using `useToast`
- Keep using `useToast` for React components
- For non-React contexts or services, use the new ToastService:
  ```typescript
  import { ToastService } from '@/lib/core/toast';
  
  // Instead of toast.success(...)
  ToastService.toast.success('Message');
  ```

### Add ToastProvider to Root Layout
- Update the app's root layout to include the ToastProvider
- This will connect the global toast service with the React toast hook

## 4. Clean Up Redundant Code

### Files to Remove or Mark as Deprecated
- `src/lib/auth/authFeedback.ts` (after all imports are updated)
- Consider marking old error utilities as deprecated with comments

### Update Exports
- Update index files to export the new services
- Consider adding re-exports for backward compatibility during transition

## 5. Testing Strategy

1. Test each auth flow (login, register, password reset)
2. Test error handling in key components
3. Test toast notifications in both React and non-React contexts
4. Verify loading states during auth operations

## 6. Rollback Plan

If issues are encountered:
1. Revert to using the original modules
2. Keep the new core services in place but don't use them yet
3. Address issues and retry the migration 