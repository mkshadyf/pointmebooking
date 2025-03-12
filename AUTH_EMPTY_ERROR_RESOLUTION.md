# Empty Error Object Tracking and Resolution

## Original Issue

We encountered a Next.js framework-level error in the login process when an empty error object (`{}`) was being passed through our error handling system:

```
Error: [ERROR] {}
    at createUnhandledError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/console-error.js:27:49)
    at handleClientError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/use-error-handler.js:44:56)
    at console.error (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/globals/intercept-console-error.js:48:56)
    at ErrorLogger.logError (webpack-internal:///(app-pages-browser)/./src/lib/error/error-logger.ts:50:17)
    at logError (webpack-internal:///(app-pages-browser)/./src/lib/error/error-logger.ts:94:24)
    at handleAuthError (webpack-internal:///(app-pages-browser)/./src/lib/error/auth-error-handler.ts:78:60)
    at onSubmit (webpack-internal:///(app-pages-browser)/./src/app/(auth)/login/page.tsx:101:95)
```

Our previous fixes helped with handling empty error objects, but didn't identify the source of those empty objects. This made debugging difficult.

## Solution Implemented

We've implemented a comprehensive error tracking system to identify exactly where empty error objects originate in the application:

### 1. Error Monitoring Utility

Created a new `error-monitoring.ts` utility that:
- Tracks error origins
- Records complete context when empty errors occur
- Captures stack traces for empty error objects
- Periodically outputs error origin statistics

```typescript
export function trackError(error: any, options: ErrorTrackingOptions): any {
  // Check for empty error objects
  const isEmpty = !error || (typeof error === 'object' && Object.keys(error).length === 0);
  
  // Increment the count for this source
  const currentCount = ERROR_ORIGINS.get(source) || 0;
  ERROR_ORIGINS.set(source, currentCount + 1);
  
  if (isEmpty) {
    // Log immediately for empty errors to capture the stack trace
    console.warn(`[ERROR TRACKER] Empty error object detected from source: ${source}`);
  }
  
  return error;
}
```

### 2. Enhanced Error Handler

Updated `auth-error-handler.ts` to:
- Track every error before handling it
- Log the source and context of errors
- Standardize error handling

```typescript
export function handleAuthError(error: any, options: ErrorHandler = {}): void {
  // Track the error origin
  error = trackError(error, {
    source: `handleAuthError:${options.context || 'unknown'}-${options.action || 'unknown'}`,
    context: options
  });
  
  // Rest of function...
}
```

### 3. Instrumented Login Page

Enhanced the login page to provide detailed tracking at each step:
- Timing metrics for authentication service calls
- Detailed context for each error scenario
- Complete error object inspection

```typescript
// Track the caught error
const caughtError = trackError(err, {
  source: 'LoginPage:catchBlock',
  context: { 
    hasErrorObject: !!err,
    errorKeys: err && typeof err === 'object' ? Object.keys(err) : [],
    isEmptyObject: err && typeof err === 'object' && Object.keys(err).length === 0,
    email: data.email
  }
});
```

### 4. Updated Error Types

Added a proper `ErrorHandler` interface to provide type safety:

```typescript
export interface ErrorHandler {
  // Whether to show a toast notification
  showToast?: boolean;
  // Context of where the error occurred (component, function, etc.)
  context?: string;
  // Action being performed when the error occurred
  action?: string;
  // User ID associated with the error
  userId?: string;
  // Function to set error message state in a component
  setErrorMessage?: (message: string | null) => void;
  // Any additional options
  [key: string]: any;
}
```

## Benefits

1. **Root Cause Analysis**: We can now pinpoint exactly which component/function is generating empty error objects
2. **Detailed Context**: Each error is tracked with comprehensive context (user action, component, timing)
3. **Easier Debugging**: Console warnings provide immediate feedback when empty errors occur
4. **Error Statistics**: Periodic reports show which components generate the most errors
5. **Type Safety**: Improved TypeScript interfaces prevent future type-related issues

## How to Use

### For Developers

When an empty error is reported, check the console logs for entries like:

```
[ERROR TRACKER] Empty error object detected from source: LoginPage:resultError
```

These logs will point directly to the source of the empty error.

### For Testing

The error tracking system produces a report in development mode showing error counts by source. This can be used to identify components that need more robust error handling.

## Next Steps

1. **Continue Monitoring**: Keep an eye on error logs to identify any recurring empty error patterns
2. **Extend Coverage**: Implement tracking in other critical areas (registration, profile updates)
3. **Server-Side Tracking**: Consider adding similar tracking for server-side errors
4. **Error Metrics**: Implement collection of error metrics to a monitoring service 