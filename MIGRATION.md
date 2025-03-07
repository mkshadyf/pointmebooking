# PointMe Codebase Migration Guide

This guide provides instructions for migrating the PointMe application to a more consistent and maintainable structure. The migration addresses several key areas including routing, types, Supabase client usage, and more.

## Why Migrate?

The codebase currently has several issues that make it harder to maintain and extend:

1. **Dual Routing Systems**: Both Pages Router (`/pages`) and App Router (`/app`) are used simultaneously, causing confusion and potential conflicts.
2. **Inconsistent Supabase Client Usage**: Different approaches to creating and using the Supabase client throughout the application.
3. **Duplicate Types and Inconsistent Type Handling**: Types are defined in multiple places with inconsistencies.
4. **Scattered Constants**: Entity constants defined in different places with redundancy.

## Migration Overview

The migration involves the following steps:

1. Unifying the Supabase client creation
2. Consolidating types and constants
3. Improving error handling
4. Moving from Pages Router to App Router

## Step 1: Run the Migration Script

We've provided a migration script that analyzes your codebase and provides recommendations:

```bash
npm run migrate
```

This will output a list of recommended changes to make to your codebase.

## Step 2: Update Imports

Update imports throughout your codebase to use the consolidated files:

### Supabase Client

```typescript
// Before
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
const supabase = createBrowserSupabaseClient();

// After
import { createSupabaseClient } from '@/lib/supabase/client';
const supabase = await createSupabaseClient();
```

### Entity Types and Constants

```typescript
// Before
import { UserStatus } from '@/types';
// or 
import { UserStatus } from '@/types/auth';

// After
import { UserStatus } from '@/constants/entities';
```

## Step 3: Migrate Pages to App Router

For each page in the `src/pages` directory:

1. Create an equivalent page in `src/app`
2. Update client/server component boundaries
3. Update metadata handling
4. Update navigation using Next.js App Router patterns

Example migration for a page:

```typescript
// Before (Pages Router): src/pages/profile.tsx
import { GetServerSideProps } from 'next';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Server-side logic
};

export default function ProfilePage() {
  return (
    <>
      <Head>
        <title>User Profile</title>
      </Head>
      <div>Profile content</div>
    </>
  );
}

// After (App Router): src/app/profile/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile',
};

export default function ProfilePage() {
  return <div>Profile content</div>;
}
```

## Step 4: Use Auth Service

Replace direct Supabase auth calls with the AuthService:

```typescript
// Before
const { error } = await supabase.auth.signInWithPassword({ email, password });

// After
const { error } = await AuthService.login({ email, password });
```

## Step 5: Test and Verify

After making these changes:

1. Run the application locally to ensure it works as expected
2. Check for any TypeScript errors: `npm run typecheck`
3. Run linting to catch any issues: `npm run lint`

## Need Help?

If you encounter issues during migration, please:

1. Check the error messages for hints
2. Refer to the Next.js App Router documentation
3. Reach out to the development team for assistance

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Supabase JavaScript Library Documentation](https://supabase.com/docs/reference/javascript/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) 