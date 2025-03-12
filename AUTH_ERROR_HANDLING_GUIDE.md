# Authentication Error Handling Guide

This guide provides best practices for handling authentication errors consistently throughout the PointMe application.

## Overview

Authentication operations can fail for various reasons:
- Network connectivity issues
- Invalid credentials
- Server errors
- Account status problems (locked, disabled, etc.)

Consistent error handling improves user experience and makes debugging easier.

## Utilities Available

The application provides specialized utilities for authentication error handling:

```typescript
import { 
  handleAuthError, 
  getAuthErrorMessage, 
  checkOnlineStatus,
  withAuthErrorHandling 
} from '@/lib/error/auth-error-handler';
```

## Basic Usage

### Function: `handleAuthError`

Use this function to handle authentication errors with consistent messaging and logging:

```typescript
try {
  const result = await auth.signInWithEmail(email, password);
  
  if (result.error) {
    handleAuthError(result.error, {
      setErrorMessage, // Optional state setter function
      context: 'LoginComponent', // Where the error occurred
      action: 'signIn' // What action was being performed
    });
    return;
  }
  
  // Success logic here
} catch (error) {
  handleAuthError(error, {
    setErrorMessage,
    context: 'LoginComponent',
    action: 'signIn'
  });
}
```

### Function: `getAuthErrorMessage`

Get a user-friendly error message for an authentication error:

```typescript
const userMessage = getAuthErrorMessage(error);
```

### Function: `checkOnlineStatus`

Check if the device is online before attempting authentication:

```typescript
if (!checkOnlineStatus(setErrorMessage)) {
  // Handle offline state
  return;
}

// Proceed with authentication
```

### Function: `withAuthErrorHandling`

Wrap an authentication operation with error handling:

```typescript
const result = await withAuthErrorHandling(
  async () => {
    // Your authentication logic here
    const result = await auth.signInWithEmail(email, password);
    
    if (result.error) {
      throw result.error; // Will be caught and handled
    }
    
    return result.data;
  },
  {
    setErrorMessage,
    context: 'LoginComponent',
    action: 'signIn'
  }
);

if (result) {
  // Success case
}
```

## Real-World Examples

### Login Component

```typescript
const onSubmit = async (data: LoginFormData) => {
  setErrorMessage(null);
  setIsSubmitting(true);

  try {
    // Check for internet connectivity first
    if (!checkOnlineStatus(setErrorMessage)) {
      setIsSubmitting(false);
      return;
    }

    const result = await auth.signInWithEmail(data.email, data.password);

    if (result.error) {
      handleAuthError(result.error, {
        setErrorMessage,
        context: 'LoginPage',
        action: 'signIn'
      });
      setIsSubmitting(false);
      return;
    }

    // Check if we have a session after login
    if (!auth.session) {
      handleAuthError(new Error('No session after login'), {
        setErrorMessage,
        context: 'LoginPage',
        action: 'sessionCheck'
      });
      setIsSubmitting(false);
      return;
    }

    ToastService.success('Login successful');
    router.push(redirectTo);
  } catch (err) {
    handleAuthError(err, {
      setErrorMessage,
      context: 'LoginPage',
      action: 'signIn'
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

### OAuth Sign-In

```typescript
const handleGoogleSignIn = async () => {
  setErrorMessage(null);
  setIsSubmitting(true);
  
  await withAuthErrorHandling(
    async () => {
      const result = await auth.signInWithGoogle();
      
      if (result.error) {
        throw result.error;
      }
    },
    {
      setErrorMessage,
      context: 'LoginPage',
      action: 'googleSignIn'
    }
  );
  
  setIsSubmitting(false);
};
```

### Reset Password Flow

```typescript
const handleResetPassword = async (email: string) => {
  setIsSubmitting(true);
  
  const result = await withAuthErrorHandling(
    async () => {
      const result = await auth.resetPassword(email);
      
      if (result.error) {
        throw result.error;
      }
      
      return true;
    },
    {
      setErrorMessage,
      context: 'ResetPasswordPage',
      action: 'resetPassword'
    }
  );
  
  if (result) {
    ToastService.success('Password reset email sent. Please check your inbox.');
    router.push('/login');
  }
  
  setIsSubmitting(false);
};
```

## Best Practices

1. **Always check network connectivity** before auth operations
2. **Use descriptive context and action names** to aid debugging
3. **Handle specific error cases** with appropriate messages
4. **Provide recovery options** when possible (e.g., "Forgot Password" link)
5. **Be consistent with error display** throughout the application
6. **Log authentication errors** for monitoring and debugging

## Common Auth Error Codes

| Error Code | User-Friendly Message | Recovery Action |
|------------|------------------------|-----------------|
| Invalid login credentials | "Invalid email or password. Please try again." | Try again or reset password |
| User not found | "No account found with this email. Please check your email or sign up." | Create account |
| Too many requests | "Too many login attempts. Please try again later or reset your password." | Wait or reset password |
| Email already in use | "This email is already registered. Please try logging in instead." | Sign in |
| Weak password | "Password is too weak. Please use a stronger password." | Choose stronger password |
| Expired token | "Your session has expired. Please log in again." | Log in again |

## Integration with Error Monitoring

Authentication errors are automatically logged to the monitoring system with:
- Error details
- User context (if available)
- Action being performed
- Component/page where the error occurred

This helps identify patterns in authentication failures and improve the system over time. 