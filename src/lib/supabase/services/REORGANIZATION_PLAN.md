# Comprehensive Reorganization Plan

This document outlines a detailed plan for reorganizing the codebase to eliminate redundancies, improve maintainability, and establish clear patterns.

## Immediate Actions (Week 1)

### 1. Implement Core Infrastructure

- [x] Create `src/lib/supabase/services/core/supabase-client.service.ts`
- [ ] Create `src/lib/supabase/services/core/index.ts` to export the client service
- [ ] Update `src/lib/supabase/client.ts` to export from the new service with deprecation notices

### 2. Consolidate Auth Hooks

- [x] Update `src/hooks/auth/useAuth.ts` to use the `authService` singleton
- [x] Add deprecation notices to `src/hooks/supabase/auth/useAuth.ts`
- [x] Create compatibility layer in `src/hooks/supabase/auth/index.ts`
- [ ] Update `src/lib/supabase/auth/context/AuthContext.tsx` to use the consolidated hook

## Files to Delete (After Compatibility Layers)

### Authentication Redundancies

1. `src/hooks/supabase/auth/useSupabaseAuth.ts` - Deprecated, redirects to useAuth
2. `src/hooks/auth/useSupabaseAuth.ts` - Deprecated, redundant implementation
3. `src/lib/supabase/hooks/useAuth.ts` - Redundant with the refactored AuthService
4. `src/lib/supabase/hooks/useSupabaseAuth.ts` - Deprecated, redundant implementation
5. `src/lib/supabase/auth/hooks/useAuth.ts` - Redundant with root useAuth hook

### Supabase Client Redundancies

6. `src/lib/supabase/client/index.ts` - Redundant with the main client.ts file
7. `src/lib/supabase/client/browser.ts` - Will be replaced by SupabaseClientService
8. `src/lib/supabase/client/server.ts` - Will be replaced by SupabaseClientService

## Directory Structure Reorganization (Week 2-3)

### 1. Create Domain-Specific Directories

- [ ] Create `src/lib/supabase/services/auth/`
- [ ] Create `src/lib/supabase/services/business/`
- [ ] Create `src/lib/supabase/services/booking/`
- [ ] Create `src/lib/supabase/services/admin/`

### 2. Move Services to Domain Directories

- [ ] Move `auth.service.ts` to `auth/auth.service.ts`
- [ ] Move business-related services to `business/`
- [ ] Move booking-related services to `booking/`
- [ ] Move admin-related services to `admin/`

### 3. Create Index Files for Each Domain

- [ ] Create `src/lib/supabase/services/auth/index.ts`
- [ ] Create `src/lib/supabase/services/business/index.ts`
- [ ] Create `src/lib/supabase/services/booking/index.ts`
- [ ] Create `src/lib/supabase/services/admin/index.ts`

### 4. Update Main Services Index

- [ ] Update `src/lib/supabase/services/index.ts` to export from domain-specific indexes

## Auth Utilities Consolidation (Week 3)

### 1. Create Consolidated Auth Directory

- [ ] Create `src/lib/auth/` directory
- [ ] Create `src/lib/auth/context/`
- [ ] Create `src/lib/auth/guards/`
- [ ] Create `src/lib/auth/errors/`

### 2. Move Auth Utilities

- [ ] Move `src/lib/supabase/auth/context/AuthContext.tsx` to `src/lib/auth/context/`
- [ ] Move `src/lib/supabase/auth/guards/` to `src/lib/auth/guards/`
- [ ] Move `src/lib/supabase/auth/errors/` to `src/lib/auth/errors/`

### 3. Update Imports

- [ ] Update imports in components using AuthContext
- [ ] Update imports in components using auth guards
- [ ] Update imports in services using auth errors

## Cleanup (Week 4)

### 1. Remove Empty Directories

- [ ] Remove `src/lib/supabase/auth/` if empty
- [ ] Remove `src/lib/supabase/client/` if empty
- [ ] Remove `src/hooks/supabase/auth/` if empty

### 2. Remove Redundant Files

- [ ] Remove all files listed in "Files to Delete" section
- [ ] Remove any other redundant files identified during reorganization

## Testing and Validation

### 1. Unit Tests

- [ ] Test SupabaseClientService
- [ ] Test updated useAuth hook
- [ ] Test AuthContext with updated hook

### 2. Integration Tests

- [ ] Test authentication flows end-to-end
- [ ] Test components that use auth hooks
- [ ] Test services that use SupabaseClientService

### 3. Manual Testing

- [ ] Test login/logout flows
- [ ] Test protected routes
- [ ] Test business onboarding
- [ ] Test service booking

## Success Criteria

1. No duplicate implementations of the same functionality
2. All services follow the singleton pattern
3. Clear directory structure with domain-specific organization
4. Consistent error handling across all services
5. Improved performance metrics
6. Reduced bundle size
7. Clearer import paths and organization 