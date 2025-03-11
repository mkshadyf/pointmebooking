# Migration Checklist

Use this checklist to track your progress in migrating to the new core services.

## Preparation

- [x] Create core services
  - [x] Error Service
  - [x] Toast Service
  - [x] Auth Service
- [x] Create compatibility layer
  - [x] Auth compatibility
  - [x] Error compatibility
  - [x] Toast compatibility
- [x] Create migration scripts
  - [x] Migration helper
  - [x] Single file migration
  - [x] Batch migration
- [x] Update root layout with ToastProvider

## Auth Components

- [x] Update AuthLoadingOverlay
- [x] Update auth pages
  - [x] Login page
  - [x] Register page
  - [x] Reset password page
  - [x] Forgot password page
  - [x] Verify email page
  - [x] Send verification page

## Error Handling

- [x] Update ErrorBoundary (example created)
- [x] Update API route handlers (example created)
- [x] Update error handling in components
  - [x] useAuth hook
  - [x] authorization.service.ts
  - [x] services/[id]/page.tsx

## Toast Notifications

- [x] Update components using useToast
  - [x] BusinessOnboardingWizard
  - [x] useAuth hook
  - [x] useBusinessOnboarding hook
- [x] Update services using toast notifications
  - [x] Added compatibility layer for toast notifications

## Testing

- [x] Fix TypeScript errors
- [x] Run linting (warnings only, no errors)
- [x] Build application (unrelated error in dashboard/admin page)
- [ ] Test auth flows
  - [ ] Login
  - [ ] Register
  - [ ] Password reset
  - [ ] Google sign-in
- [ ] Test error handling
  - [ ] Client-side errors
  - [ ] Server-side errors
- [ ] Test toast notifications
  - [ ] Success messages
  - [ ] Error messages
  - [ ] Info messages

## Clean Up

- [ ] Remove deprecated code
  - [ ] authFeedback.ts
  - [ ] error-logger.ts
- [x] Update documentation
  - [x] Update README files
  - [x] Update comments

## Final Steps

- [x] Run TypeScript type checking
- [x] Run linting
- [x] Build application (with unrelated error)
- [ ] Manual testing 