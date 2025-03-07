# Codebase Redundancies and Cleanup Recommendations

## Authentication Hooks Redundancies

### Current Situation

The codebase currently has multiple implementations of authentication hooks that serve similar purposes:

1. **Duplicate Auth Hooks:**
   - `src/hooks/auth/useAuth.ts` - Uses the auth store for state management
   - `src/hooks/supabase/auth/useAuth.ts` - Direct implementation using Supabase client
   - Both provide similar functionality but with different implementations

2. **Deprecated Hooks:**
   - `src/hooks/auth/useSupabaseAuth.ts` - Marked as deprecated, redirects to useAuth
   - `src/hooks/supabase/auth/useSupabaseAuth.ts` - Also marked as deprecated, redirects to its local useAuth

3. **Confusing Import Paths:**
   - Multiple export locations for similar functionality
   - Unclear which hook should be used in new code

4. **Inconsistent Implementation:**
   - The root `useAuth` hook uses the auth store
   - The Supabase `useAuth` hook directly uses the Supabase client
   - Both hooks have similar interfaces but different internal implementations

## Supabase Client Redundancies

### Current Situation

The Supabase client implementation has some issues:

1. **Direct Exports:**
   - `src/lib/supabase/client.ts` exports a default `supabase` instance
   - This bypasses the singleton pattern we've established for services

2. **Inconsistent Usage:**
   - Some code uses the exported instance directly
   - Other code creates new instances using the factory functions

## Directory Structure Redundancies

### Current Situation

The codebase has some structural redundancies:

1. **Duplicate Hook Directories:**
   - `src/hooks/auth` and `src/hooks/supabase/auth` contain similar functionality
   - This creates confusion about which hooks to use

2. **Scattered Service Implementations:**
   - Some services are in the root of `src/lib/supabase/services`
   - Others are in subdirectories like `categories` and `notifications`
   - No clear pattern for when to use subdirectories

## Recommendations

### 1. Consolidate Auth Hooks

Create a single source of truth for authentication hooks:

1. **Keep only one implementation of `useAuth`:**
   - Retain the implementation that uses the auth store (`src/hooks/auth/useAuth.ts`)
   - This aligns with the singleton pattern we've implemented for services

2. **Remove redundant implementations:**
   - Remove `src/hooks/supabase/auth/useAuth.ts`
   - Update imports across the codebase to use the single implementation

3. **Create clear migration path:**
   - Add deprecation notices with clear migration instructions
   - Provide a temporary compatibility layer if needed

### 2. Standardize Auth Hook Usage with AuthService

1. **Update the remaining `useAuth` hook to use `authService` singleton:**
   - Modify `src/hooks/auth/useAuth.ts` to use the `authService` singleton instead of directly accessing the auth store
   - This creates a consistent pattern where hooks use services, and services use stores

2. **Simplify the auth hook API:**
   - Remove unnecessary methods and options
   - Ensure the hook provides only what components need

### 3. Clean Up Deprecated Files

1. **Remove deprecated hooks:**
   - Remove both `useSupabaseAuth.ts` files after ensuring no components use them
   - Update any components still using these hooks to use the consolidated hook

2. **Update exports:**
   - Update `src/hooks/auth/index.ts` to export only the consolidated hook
   - Remove `src/hooks/supabase/auth/index.ts` entirely

### 4. Supabase Client Cleanup

1. **Standardize Supabase client usage:**
   - Ensure all code uses the singleton pattern for Supabase client access
   - Remove direct imports of `supabase` from `src/lib/supabase/client.ts`
   - Create a proper singleton for the Supabase client if not already done

### 5. Reorganize Directory Structure

1. **Consolidate hook directories:**
   - Move all authentication hooks to a single location
   - Update imports across the codebase

2. **Standardize service organization:**
   - Establish clear criteria for when to use subdirectories
   - Consider grouping related services (e.g., all category-related services together)

### 6. Refactor Remaining Services to Singleton Pattern

1. **Identify remaining services:**
   - Check which services haven't been refactored to use the singleton pattern
   - Prioritize high-usage services

2. **Apply consistent pattern:**
   - Ensure all services follow the same singleton implementation pattern
   - Add static wrappers for backward compatibility where needed

## Implementation Plan

1. First, update the remaining `useAuth` hook to use the `authService` singleton
2. Add deprecation notices to the redundant hooks with clear migration instructions
3. Update components to use the consolidated hook
4. Remove deprecated files once no longer in use
5. Update documentation to reflect the new structure
6. Refactor the Supabase client to follow the singleton pattern
7. Reorganize the directory structure for better organization
8. Refactor remaining services to follow the singleton pattern

## Benefits

- **Reduced code duplication:** Single source of truth for authentication
- **Improved maintainability:** Consistent patterns across the codebase
- **Better developer experience:** Clear import paths and usage patterns
- **Reduced bundle size:** Fewer redundant implementations
- **Consistent error handling:** Standardized approach to auth errors
- **Clearer organization:** Logical directory structure
- **Better performance:** Shared instances reduce memory usage 