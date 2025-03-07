# Codebase Cleanup Implementation Plan

This document outlines a step-by-step plan for cleaning up redundancies in the codebase and improving the overall architecture.

## Phase 1: Authentication Hooks Consolidation

### Step 1: Update Root Auth Hook to Use AuthService Singleton
- Modify `src/hooks/auth/useAuth.ts` to use the `authService` singleton
- Ensure all methods delegate to the corresponding methods in `authService`
- Add comprehensive JSDoc comments to clarify usage
- **Update `src/lib/supabase/auth/context/AuthContext.tsx` to use the consolidated hook**
- **Ensure compatibility with `src/lib/supabase/store/auth.store.ts`**

### Step 2: Add Deprecation Notices
- Add clear deprecation notices to `src/hooks/supabase/auth/useAuth.ts`
- Update the notice to direct users to import from `@/hooks/auth` instead
- Add similar notices to both `useSupabaseAuth.ts` files
- **Add notices to any duplicate hooks in `src/lib/supabase/hooks/`**

### Step 3: Create Temporary Compatibility Layer
- Update `src/hooks/supabase/auth/index.ts` to re-export from `@/hooks/auth`
- This allows for a gradual migration without breaking existing code
- **Create compatibility layers for any other affected hooks**

### Step 4: Update Component Imports
- Identify all components using the deprecated hooks
- Update imports to use the consolidated hook from `@/hooks/auth`
- Test thoroughly to ensure functionality is preserved
- **Focus on critical components:**
  - **`src/components/authorization/ProtectedRoute.tsx` and `PermissionGuard.tsx`**
  - **Auth components in `src/components/auth/`**
  - **Dashboard components that use auth state**

### Step 5: Remove Deprecated Files
- Once all components have been updated, remove:
  - `src/hooks/supabase/auth/useAuth.ts`
  - `src/hooks/supabase/auth/useSupabaseAuth.ts`
  - `src/hooks/auth/useSupabaseAuth.ts` (or keep with stronger deprecation notice)
  - `src/hooks/supabase/auth/index.ts`
  - **Any duplicate hooks in `src/lib/supabase/hooks/`**

## Phase 2: Supabase Client Refactoring

### Step 1: Create Supabase Client Singleton
- Create a new `SupabaseClientService` class that follows the singleton pattern
- Implement proper error handling and retry logic
- Ensure it provides all necessary functionality
- **Integrate with existing client implementations:**
  - **`src/lib/supabase/client/browser.ts`**
  - **`src/lib/supabase/client/server.ts`**

### Step 2: Update Client Exports
- Modify `src/lib/supabase/client.ts` to export the singleton instance
- Add deprecation notice for direct imports of `supabase`
- Provide clear migration path in comments
- **Ensure backward compatibility with existing imports**

### Step 3: Update Service Implementations
- Identify all services using the direct `supabase` import
- Update to use the new `SupabaseClientService` singleton
- Test thoroughly to ensure functionality is preserved
- **Pay special attention to:**
  - **`src/middleware.ts` for server-side authentication**
  - **API route handlers**
  - **Server components that use Supabase**

## Phase 3: Authorization Integration

### Step 1: Ensure Authorization Service Compatibility
- Review `src/lib/authorization/authorization.service.ts`
- Update to use the `authService` singleton if needed
- Ensure proper integration with the refactored auth services
- **Test with `src/lib/security/permissions.ts` and other security utilities**

### Step 2: Update Error Handling
- Ensure consistent use of error utilities:
  - `src/lib/error/auth-error-converter.ts`
  - `src/lib/error/auth-error-utils.ts`
- Update any custom error handling in services to use these utilities
- **Test error scenarios to ensure proper handling**

### Step 3: Security Integration
- Review security implementations in `src/lib/security/`
- Update to use the refactored services
- Ensure two-factor authentication still works properly
- **Test security features thoroughly**

## Phase 4: Directory Structure Reorganization

### Step 1: Establish Directory Structure Guidelines
- Document clear criteria for when to use subdirectories
- Define naming conventions and organization principles
- Create a directory structure plan
- **Consider the entire application structure, not just services**

### Step 2: Reorganize Services
- Move category services to a consistent location
- Consider grouping related services (e.g., all user-related services)
- Update imports across the codebase
- **Ensure middleware and API routes are updated**

### Step 3: Update Documentation
- Update README files to reflect the new structure
- Document the organization principles for future development
- **Create a comprehensive architecture diagram**

## Phase 5: Remaining Service Refactoring

### Step 1: Identify Remaining Services
- Review all services in `src/lib/supabase/services`
- Identify which ones haven't been refactored to use the singleton pattern
- Prioritize based on usage and importance
- **Consider dependencies between services**

### Step 2: Refactor High-Priority Services
- Apply the singleton pattern to high-priority services
- Add static wrappers for backward compatibility
- Test thoroughly to ensure functionality is preserved
- **Update any components that directly use these services**

### Step 3: Refactor Remaining Services
- Apply the singleton pattern to all remaining services
- Ensure consistent implementation across all services
- Test thoroughly to ensure functionality is preserved
- **Ensure all services follow the same pattern**

## Phase 6: Testing and Documentation

### Step 1: Comprehensive Testing
- Test all refactored components and services
- Ensure no regressions in functionality
- Verify performance improvements
- **Test critical user flows:**
  - **Authentication flows**
  - **Authorization checks**
  - **Business onboarding**
  - **Service booking**

### Step 2: Update Documentation
- Update all documentation to reflect the new architecture
- Provide clear guidelines for future development
- Document the benefits of the new architecture
- **Create architecture decision records (ADRs) for major changes**

### Step 3: Create Migration Guide
- Create a guide for any remaining code that needs to be updated
- Document common patterns and best practices
- Provide examples of correct usage
- **Include troubleshooting section for common issues**

## Timeline and Priorities

### Immediate (1-2 days)
- Update root auth hook to use AuthService singleton
- Add deprecation notices to redundant hooks
- Create temporary compatibility layer
- **Review and update AuthContext**

### Short-term (3-5 days)
- Create Supabase client singleton
- Update component imports for auth hooks
- Refactor high-priority services
- **Ensure authorization service compatibility**

### Medium-term (1-2 weeks)
- Reorganize directory structure
- Remove deprecated files
- Refactor remaining services
- **Update security implementations**

### Long-term (2-4 weeks)
- Comprehensive testing
- Update documentation
- Create migration guide
- **Performance optimization**

## Risk Assessment and Mitigation

### High-Risk Areas
- **Authentication Context**: Changes could break app-wide auth state
  - *Mitigation*: Thorough testing of auth flows before deployment
- **Middleware**: Server-side auth changes could affect all routes
  - *Mitigation*: Staged rollout with monitoring
- **Security Features**: Two-factor auth and permissions
  - *Mitigation*: Dedicated testing for security features

### Medium-Risk Areas
- **Component Guards**: Route protection might be affected
  - *Mitigation*: Test all protected routes
- **API Routes**: Authentication for API calls
  - *Mitigation*: Comprehensive API testing

### Low-Risk Areas
- **Documentation Updates**: Low impact on functionality
  - *Mitigation*: Peer review of documentation

## Success Metrics

- **Reduced code duplication:** Measured by lines of code and duplicate functionality
- **Improved maintainability:** Measured by code complexity metrics
- **Better developer experience:** Measured by developer feedback
- **Reduced bundle size:** Measured by bundle analysis
- **Consistent error handling:** Measured by error tracking
- **Clearer organization:** Measured by directory structure analysis
- **Better performance:** Measured by memory usage and response times
- **Security integrity:** Measured by security audit results 