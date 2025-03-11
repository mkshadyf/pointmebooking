# Implementation Roadmap

## Current Status
- Project Phase: Refactoring and Bug Fixing
- Current Focus: Registration and Onboarding Flow

## GPS: Where We Are
- ✅ Core functionality implemented
- ✅ Toast service implementation
- ✅ Authentication service consolidation
- ✅ OAuth callback role-based redirection
- ⬜ Onboarding data persistence in progress
- ⬜ Component standardization in progress
- ⬜ Type safety improvements in progress
- ⬜ Error handling centralization in progress

## Implementation Timeline

### Phase 1: API Consistency (Completed)
- [x] Refactor ToastService API to remove redundant `.toast` property
- [x] Create scripts to update all references in the codebase
- [x] Ensure backward compatibility for existing code
- [x] Consolidate auth services with compatibility layer
- [x] Add deprecation notices and migration guide for auth services

### Phase 2: Registration and Onboarding Flow (Current)
- [x] Fix role-based redirection in OAuth callback
- [x] Add proper error handling in OAuth callback
- [ ] Implement server-side storage for onboarding progress
- [ ] Add validation for onboarding data
- [ ] Enhance error handling for API failures during onboarding

### Phase 3: Component Standardization
- [ ] Audit all UI components for naming consistency
- [ ] Standardize component casing (e.g., TextArea vs Textarea)
- [ ] Update imports and references throughout the codebase
- [ ] Add documentation for component naming conventions

### Phase 4: Type Safety Improvements
- [ ] Audit and improve type assertions in transformers.ts
- [ ] Reduce usage of 'any' types throughout the codebase
- [ ] Implement stricter TypeScript configurations
- [ ] Add runtime type checking for critical data paths

### Phase 5: Error Handling Centralization
- [ ] Create centralized error handling service
- [ ] Standardize error reporting across the application
- [ ] Improve user-facing error messages
- [ ] Implement error logging and monitoring

## Technical Implementation Details

### OAuth Callback Improvement
The OAuth callback route was updated to check the user's role and onboarding status before redirecting:

1. After exchanging the code for a session, the user's profile is fetched from the database
2. The profile is checked for role and onboarding status
3. Business users who haven't completed onboarding are redirected to the business onboarding flow
4. Other users are redirected to their appropriate dashboard based on role
5. Proper error handling was added with specific error messages and appropriate redirects

```typescript
// Get profile to check if business user and onboarding status
const { data: profile } = await supabase
  .from('profiles')
  .select('role, onboarding_completed')
  .eq('id', user.id)
  .single();

// If business user and onboarding not completed, redirect to onboarding
if (profile?.role === 'business' && profile?.onboarding_completed === false) {
  return NextResponse.redirect(new URL(ROUTES.businessOnboarding.path, requestUrl.origin));
}
```

### Auth Service Consolidation
The project had two competing auth service implementations:
1. Simplified auth service in `src/lib/core/auth/auth-service.ts`
2. Comprehensive auth service in `src/lib/supabase/services/auth/auth.service.ts`

To address this duplication, we:
1. Created a compatibility layer in the simplified auth service that forwards calls to the comprehensive auth service
2. Added deprecation notices to the simplified auth service and related hooks
3. Created a comprehensive migration guide in `src/lib/core/auth/README.md`

This approach allows for:
- Backward compatibility with existing code
- Gradual migration to the comprehensive auth service
- Clear documentation for future development

```typescript
// Before (deprecated)
import { AuthService } from '@/lib/core/auth/auth-service';
await AuthService.signInWithEmail(email, password);

// After (recommended)
import { authService } from '@/lib/supabase/services/auth/auth.service';
await authService.login({ email, password });
```

### Toast Service Refactoring
The ToastService API was simplified by removing the redundant `.toast` property. This change makes the API more intuitive and consistent with other service implementations in the codebase.

```typescript
// Before
ToastService.toast.success('Operation completed successfully');

// After
ToastService.success('Operation completed successfully');
```

Scripts were created to automatically update all references in the codebase:
- Shell script (fix-toast.sh) for Unix-based systems
- PowerShell script (fix-toast.ps1) for Windows systems
- JavaScript script (fix-toast-references.js) for cross-platform compatibility

### Component Standardization
Component naming will follow these conventions:
- PascalCase for component names
- Consistent casing across imports and usage
- Standardized naming patterns for related components

### Type Safety Improvements
Type safety will be improved by:
- Using explicit type annotations instead of inferred types
- Eliminating 'any' types where possible
- Adding runtime type validation for external data
- Implementing stricter TypeScript configurations

## Critical Considerations
1. **Backward Compatibility**: Ensure changes don't break existing functionality
2. **Performance Impact**: Monitor performance metrics during refactoring
3. **Developer Experience**: Maintain clear documentation for API changes
4. **Testing Coverage**: Ensure adequate test coverage for refactored code

## Next Steps
1. Implement server-side storage for onboarding progress
2. Add validation for onboarding data
3. Enhance error handling for API failures during onboarding
4. Continue migrating components to use the comprehensive auth service
5. Complete component casing standardization
6. Address remaining type safety issues in transformers.ts
7. Improve error handling centralization

## Last Updated
2024-03-11 