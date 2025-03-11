# Migration Scripts

This directory contains scripts to help with the migration to the new core services.

## Scripts

### `migration-helper.ts`

This script helps identify files that need to be updated to use the new core services.

```bash
npx ts-node migration-helper.ts
```

### `migrate-file.js`

This script helps migrate a single file to use the new core services.

```bash
node migrate-file.js <file-path>
```

Example:
```bash
node migrate-file.js ../../components/auth/AuthLoadingOverlay.tsx
```

### `migrate-batch.js`

This script helps migrate multiple files in a directory to use the new core services.

```bash
node migrate-batch.js <directory-path> [--dry-run]
```

Example:
```bash
# Dry run to see what changes would be made
node migrate-batch.js ../../components/auth --dry-run

# Actually make the changes
node migrate-batch.js ../../components/auth
```

## Migration Process

1. Run `migration-helper.ts` to identify files that need to be updated
2. Use `migrate-file.js` or `migrate-batch.js` to update the files
3. Test the changes thoroughly
4. Repeat for other directories

## Patterns Replaced

The scripts replace the following patterns:

1. Imports from `@/lib/auth/authFeedback` → `@/lib/core`
2. Imports from `@/lib/error/error-logger` → `@/lib/core/error`
3. `withAuthFeedback` function calls → `compat.withAuthFeedback`
4. `logError` function calls → `ErrorService.handleError`
5. `useAuthState` hook usage → `useAuthService`

## Manual Steps

Some changes may need to be made manually:

1. Update the root layout to include the `ToastProvider`
2. Update components that use toast notifications to use the new `ToastService`
3. Update error boundaries to use the new `ErrorService`

See the [Migration Plan](../MIGRATION_PLAN.md) for more details. 