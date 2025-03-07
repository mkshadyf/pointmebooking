# Deletion Plan for Redundant Files

The following files should be deleted as part of our cleanup effort:

## Authentication Hooks Redundancies

1. `src/hooks/supabase/auth/useSupabaseAuth.ts` - Deprecated, redirects to useAuth
2. `src/hooks/auth/useSupabaseAuth.ts` - Deprecated, redundant implementation
3. `src/lib/supabase/hooks/useAuth.ts` - Redundant with the refactored AuthService
4. `src/lib/supabase/hooks/useSupabaseAuth.ts` - Deprecated, redundant implementation
5. `src/lib/supabase/auth/hooks/useAuth.ts` - Redundant with root useAuth hook

## Supabase Client Redundancies

6. `src/lib/supabase/client/index.ts` - Redundant with the main client.ts file
7. `src/lib/supabase/client/browser.ts` - Will be replaced by SupabaseClientService
8. `src/lib/supabase/client/server.ts` - Will be replaced by SupabaseClientService

## Directory Structure Redundancies

9. `src/hooks/supabase/auth/index.ts` - Will be replaced by compatibility layer
10. `src/lib/supabase/hooks/index.ts` - Redundant exports that should be consolidated

## Implementation Plan

### Phase 1: Add Deprecation Notices
Before deleting these files, we'll add deprecation notices to ensure a smooth transition:

```typescript
/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the AuthService singleton from '@/lib/supabase/services/auth.service' instead.
 */
```

### Phase 2: Create Compatibility Layers
For files that are imported in many places, we'll create compatibility layers that re-export from the new locations:

```typescript
// src/hooks/supabase/auth/index.ts
/**
 * @deprecated This module is deprecated. Import from '@/hooks/auth' instead.
 */
export * from '@/hooks/auth';
```

### Phase 3: Delete Files
After ensuring all imports are updated, we'll delete the redundant files.

## Verification Steps

Before deleting each file:
1. Search for imports of the file across the codebase
2. Update all imports to use the new location
3. Run tests to ensure functionality is preserved
4. Only then delete the file

## Rollback Plan

If issues are encountered:
1. Restore the deleted files from version control
2. Revert import changes
3. Address the issues before attempting deletion again 