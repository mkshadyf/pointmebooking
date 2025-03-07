# Authentication Module

This module provides centralized authentication functionality for the PointMe application.

## Overview

The authentication system is built on Supabase Auth with a custom abstraction layer to manage user authentication, session handling, and role-based access control. It follows a single source of truth principle to avoid duplication and ensure consistent behavior.

## Key Components

### Context and Provider

- `AuthContext`: React context providing authentication state and methods
- `AuthProvider`: Provider component that wraps the application and manages auth state

### Hooks

- `useAuth`: Primary hook for accessing auth state and methods in components
- `useSupabaseAuth`: Lower-level hook for direct Supabase auth access

### Guards

- `RoleBasedGuard`: Component to restrict access based on user roles
- `withAuth`: HOC to wrap components that require authentication

### Services

- `AuthService`: Service for authentication operations
- `SessionService`: Service for session management

### Utils

- `auth-error-utils`: Utilities for handling and converting auth errors
- `permission-check`: Utilities for checking user permissions

## Authorization

The auth module also includes authorization functionality:

- Role-based access control (user, business, admin)
- Permission-based access for granular control
- Support for conditions in permission checks

## Usage Examples

### Basic Authentication

```tsx
import { useAuth } from '@/lib/auth';

function LoginPage() {
  const { login, isLoading, error } = useAuth();
  
  const handleSubmit = async (data) => {
    await login(data.email, data.password);
  };
  
  return (
    // Login form implementation
  );
}
```

### Protected Routes

```tsx
import { RoleBasedGuard, AuthRole } from '@/lib/auth';

function AdminSettings() {
  return (
    <RoleBasedGuard roles={[AuthRole.ADMIN]}>
      <AdminSettingsPanel />
    </RoleBasedGuard>
  );
}
```

### User Profile Access

```tsx
import { useAuth } from '@/lib/auth';

function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {profile?.full_name || user?.email}</h1>
      {/* Profile content */}
    </div>
  );
}
```

## Security Features

- Email verification
- Password strength requirements
- Session management
- CSRF protection
- Rate limiting for auth endpoints

## Type Definitions

The module uses TypeScript for type safety, with key types including:

- `AuthUser`: User profile information
- `AuthRole`: Enum of available user roles
- `Permission`: Interface for permission definitions

## Best Practices

- Always use the `useAuth` hook instead of direct Supabase calls
- Implement proper error handling for auth operations
- Use role-based guards for protected routes
- Validate form inputs before authentication attempts
- Store sensitive information securely 