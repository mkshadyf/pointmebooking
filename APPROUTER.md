# App Router Structure

This document outlines the structure of the PointMe application using Next.js App Router, which replaced the previous Pages Router implementation.

## App Router vs Pages Router

The App Router is Next.js's newer, more powerful routing system that offers several advantages:

- **Server Components**: Better performance and reduced JavaScript bundle size
- **Nested Layouts**: Share UI between routes while preserving state
- **Loading States**: Built-in loading UI for improved user experience
- **Server Actions**: Form handling with server functions
- **Route Groups**: Organize routes without affecting URL paths
- **Metadata API**: Improved SEO with dynamic metadata

## Directory Structure

The App Router follows a file-system based routing approach within the `/app` directory:

```
/app
├── (app)                 # Route group for authenticated app routes
│   ├── dashboard         # Dashboard pages
│   │   ├── business      # Business dashboard
│   │   ├── customer      # Customer dashboard 
│   │   └── admin         # Admin dashboard
│   ├── businesses        # Business listings
│   ├── services          # Services section
│   ├── onboarding        # Onboarding flows
│   └── verify-email      # Email verification
├── (auth)                # Route group for auth pages
│   ├── login             # Login page
│   ├── register          # Registration page
│   ├── forgot-password   # Password reset request
│   ├── reset-password    # Set new password
│   └── verify-email      # Email verification
├── auth                  # Auth related API routes
│   └── callback          # OAuth callback
├── api                   # API routes
├── page.tsx              # Homepage
├── layout.tsx            # Root layout
└── actions.ts            # Server actions
```

## Special Files

The App Router uses special file names with specific functions:

- **page.tsx**: Defines a route and makes it publicly accessible
- **layout.tsx**: Wraps pages in a persistent UI
- **loading.tsx**: Shows while page content loads
- **error.tsx**: Error boundary for handling errors
- **not-found.tsx**: Displayed for non-existent routes

## Route Groups

Route groups (folders in parentheses) organize routes without affecting the URL structure:

- **(app)**: Contains authenticated application pages
- **(auth)**: Contains authentication-related pages

## Authentication Flow

1. User logs in via `/login`
2. Next.js middleware validates authentication
3. Authenticated users access protected routes in the `(app)` group
4. Unauthenticated users are redirected to auth pages

## Migration Notes

When transitioning from Pages Router to App Router:

1. **Pages in Pages Router → Pages in App Router**:
   - `/pages/dashboards/BusinessDashboard.tsx` → `/app/(app)/dashboard/business/page.tsx`
   - `/pages/auth/LoginPage.tsx` → `/app/(auth)/login/page.tsx`

2. **Layouts**:
   - `_app.tsx` equivalent is now `/app/layout.tsx`

3. **API Routes**:
   - `/pages/api/*` → `/app/api/*/route.ts`

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Layouts and Templates](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) 