# Error Handling Consolidation Plan

## Current State

The codebase currently has multiple utilities for handling authentication errors:

1. **auth-error-utils.ts**
   - Contains the main implementation of error conversion functions
   - Provides `convertToAuthError`, `toAuthError`, `appErrorToAuthError`, and `authErrorToAppError` functions

2. **auth-error-converter.ts**
   - Simply re-exports functions from auth-error-utils.ts
   - Exists for backward compatibility

This duplication creates confusion and makes it harder to maintain the codebase.

## Consolidation Plan

### Phase 1: Identify Usage

1. **Identify all imports of auth-error-converter.ts**
   - Search for `import { convertToAuthError } from '@/lib/error/auth-error-converter'`
   - Search for `import { toAuthError } from '@/lib/error/auth-error-converter'`

2. **Identify all imports of auth-error-utils.ts**
   - Search for `import { convertToAuthError } from '@/lib/error/auth-error-utils'`
   - Search for `import { toAuthError } from '@/lib/error/auth-error-utils'`
   - Search for `import { appErrorToAuthError } from '@/lib/error/auth-error-utils'`
   - Search for `import { authErrorToAppError } from '@/lib/error/auth-error-utils'`

### Phase 2: Update Imports

1. **Update all imports to use auth-error-utils.ts**
   - Replace `import { convertToAuthError } from '@/lib/error/auth-error-converter'` with `import { convertToAuthError } from '@/lib/error/auth-error-utils'`
   - Replace `import { toAuthError } from '@/lib/error/auth-error-converter'` with `import { toAuthError } from '@/lib/error/auth-error-utils'`

2. **Update index.ts exports**
   - Ensure that `src/lib/error/index.ts` exports from auth-error-utils.ts instead of auth-error-converter.ts

### Phase 3: Deprecate and Remove

1. **Update auth-error-converter.ts to include deprecation notice**
   ```typescript
   /**
    * @deprecated This module is deprecated. Import directly from '@/lib/error/auth-error-utils.ts' instead.
    * This file will be removed in a future version.
    */
   
   export { convertToAuthError, toAuthError } from './auth-error-utils';
   ```

2. **Remove auth-error-converter.ts in a future release**
   - After all imports have been updated, remove the file
   - Update any remaining references to use auth-error-utils.ts

### Phase 4: Standardize Error Handling

1. **Ensure consistent error handling patterns**
   - All authentication errors should be converted using `convertToAuthError`
   - All error logging should use the `logError` function
   - All user-facing error messages should be handled through the `ToastService`

2. **Update documentation**
   - Update any documentation that references auth-error-converter.ts
   - Ensure that all error handling examples use the correct imports

## Implementation Steps

1. **Identify Usage**
   ```bash
   grep -r "from '@/lib/error/auth-error-converter'" --include="*.ts" --include="*.tsx" src/
   grep -r "from '@/lib/error/auth-error-utils'" --include="*.ts" --include="*.tsx" src/
   ```

2. **Update Imports**
   - For each file identified in step 1, update the imports to use auth-error-utils.ts

3. **Update index.ts**
   - Update `src/lib/error/index.ts` to export from auth-error-utils.ts

4. **Deprecate auth-error-converter.ts**
   - Add deprecation notice to auth-error-converter.ts

5. **Test**
   - Run tests to ensure that all error handling still works correctly
   - Manually test authentication flows to verify error handling

6. **Document**
   - Update documentation to reflect the changes
   - Add a note to the migration guide about the deprecation

## Timeline

- **Phase 1 (Identify Usage)**: 1 day
- **Phase 2 (Update Imports)**: 2-3 days
- **Phase 3 (Deprecate and Remove)**: 1 day
- **Phase 4 (Standardize Error Handling)**: 3-5 days

Total estimated time: 7-10 days

## Risks and Mitigations

- **Risk**: Breaking changes in error handling
  - **Mitigation**: Keep auth-error-converter.ts as a compatibility layer until all imports are updated

- **Risk**: Inconsistent error handling patterns
  - **Mitigation**: Create clear documentation and examples for error handling

- **Risk**: Missing some imports
  - **Mitigation**: Use automated tools to find all imports and verify changes

## Conclusion

Consolidating the error handling utilities will make the codebase more maintainable and reduce confusion. By following this plan, we can ensure a smooth transition to a more consistent error handling approach. 