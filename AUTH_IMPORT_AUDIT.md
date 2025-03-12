# Auth Import Audit Report

## Summary

- **Total references:** 5
- **Files affected:** 2
- **Import references:** 0
- **Usage references:** 5

## Files Needing Updates

- `src/lib/core/scripts/migration-helper.ts`
- `src/lib/supabase/services/auth/auth.service.ts`

## Import References

No import references found.


## Usage References

| File | Usage Pattern | Replacement |
|------|---------------|-------------|
| `src/lib/core/scripts/migration-helper.ts` | `AuthService.` | `authService.` |
| `src/lib/supabase/services/auth/auth.service.ts` | `AuthService.` | `authService.` |
| `src/lib/supabase/services/auth/auth.service.ts` | `AuthService.` | `authService.` |
| `src/lib/supabase/services/auth/auth.service.ts` | `AuthService.` | `authService.` |
| `src/lib/supabase/services/auth/auth.service.ts` | `AuthService.` | `authService.` |

## Migration Instructions

1. Update imports to use the comprehensive implementation:
   ```typescript
   // Before
   import { AuthService } from '@/lib/core/auth';

   // After
   import { authService } from '@/lib/supabase/services/auth/auth.service';
   ```

2. Update method calls to use the instance instead of static methods:
   ```typescript
   // Before
   const result = await AuthService.signInWithEmail(email, password);

   // After
   const result = await authService.login({ email, password });
   ```

3. Reference the method mapping table in the documentation for equivalent methods.
