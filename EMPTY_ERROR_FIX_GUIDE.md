# Comprehensive Guide: Fixing Empty Error Objects in Next.js

## Problem Summary

We encountered a persistent issue with empty error objects (`{}`) being passed through our error handling chain in our Next.js application. The error manifested in the console as:

```
Error: [ERROR] {}
    at createUnhandledError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/console-error.js:27:49)
    at handleClientError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/use-error-handler.js:44:56)
    at console.error (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/globals/intercept-console-error.js:48:56)
    at ErrorLogger.logError (webpack-internal:///(app-pages-browser)/./src/lib/error/error-logger.ts:97:21)
    at logError (webpack-internal:///(app-pages-browser)/./src/lib/error/error-logger.ts:171:28)
    at handleAuthError (webpack-internal:///(app-pages-browser)/./src/lib/error/auth-error-handler.ts:115:64)
    at onSubmit (webpack-internal:///(app-pages-browser)/./src/app/(auth)/login/page.tsx:153:95)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2317:17)
```

This issue occurred despite our previous attempts to fix it, indicating a deeper underlying problem.

## Root Causes & Challenges

1. **Next.js Error Boundaries**: Next.js sometimes generates empty error objects from its error boundaries
2. **Error Transformation Chain**: Errors pass through multiple layers that can mutate or replace them
3. **Timing Issues**: Error interception needs to happen at all possible entry points
4. **TypeScript Integration**: Properly typing augmented Error objects is challenging

## Our Multi-Layered Solution

We implemented a comprehensive, multi-layered solution to ensure empty error objects are properly handled at every possible entry point.

### 1. Centralized Error Interceptor

Created a new file: `src/lib/error/error-interceptor.ts` with core functions:

```typescript
// Check for empty errors consistently
export function isEmptyError(error: any): boolean {
  return (
    !error || 
    (typeof error === 'object' && Object.keys(error).length === 0) ||
    (error instanceof Error && !error.message && !error.name && !error.stack)
  );
}

// Guarantee an error is never empty
export function ensureError(error: any, source: string = 'unknown'): InterceptedError {
  if (isEmptyError(error)) {
    console.warn(`[ERROR INTERCEPTOR] Empty error intercepted from ${source}`);
    return new Error(`Unknown error intercepted from ${source}`) as InterceptedError;
  }
  // ...handle other cases
}

// Add diagnostic data to errors
export function addDiagnostics(error: InterceptedError, source: string, context?: Record<string, any>): InterceptedError {
  // Add __source, __timestamp, etc. as non-enumerable properties
}

// Main entry point
export function interceptError(error: any, source: string, context?: Record<string, any>): InterceptedError {
  const validError = ensureError(error, source);
  return addDiagnostics(validError, source, context);
}
```

### 2. Global Console.error Override

In `error-interceptor.ts`, we added a global override for console.error:

```typescript
export function setupGlobalErrorInterception(): void {
  if (typeof window !== 'undefined') {
    // Store original console.error
    const originalConsoleError = console.error;
    
    // Override console.error
    console.error = function(...args) {
      // Check first argument for empty error
      if (args.length > 0 && isEmptyError(args[0])) {
        args[0] = interceptError(args[0], 'console.error');
      }
      
      // Call original
      originalConsoleError.apply(console, args);
    };
  }
}
```

### 3. Error Boundary Enhancement

Updated `src/components/error/ErrorBoundary.tsx` to intercept empty errors:

```typescript
static getDerivedStateFromError(error: Error): ErrorBoundaryState {
  // Intercept empty errors before updating state
  if (isEmptyError(error)) {
    error = interceptError(error, 'ErrorBoundary.getDerivedStateFromError');
  }
  
  return { hasError: true, error };
}

componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  // Intercept empty errors before logging
  if (isEmptyError(error)) {
    error = interceptError(error, 'ErrorBoundary.componentDidCatch', {
      componentStack: errorInfo.componentStack
    });
  }
  
  logError(error, undefined, {
    componentStack: errorInfo.componentStack
  });
}
```

### 4. Enhanced Login Page

In `src/app/(auth)/login/page.tsx`, we updated error handling:

```typescript
// CRITICAL: Intercept empty errors immediately
if (result.error) {
  const source = 'LoginPage:resultError';
  if (isEmptyError(result.error)) {
    console.warn('[Login] Empty error object detected in result.error, intercepting');
    result.error = interceptError(result.error, source, { 
      email: data.email, 
      action: 'signIn-resultError' 
    });
  }
  
  // Rest of the error handling...
}
```

### 5. Error Logger Updates

Enhanced `src/lib/error/error-logger.ts`:

```typescript
async logError(error: any, userId?: string, context?: Record<string, any>): Promise<void> {
  try {
    // CRITICAL: Intercept any empty errors first
    const source = `ErrorLogger.logError:${context?.action || 'unknown'}`;
    if (isEmptyError(error)) {
      error = interceptError(error, source, { userId, ...context });
    }
    
    // Rest of the error logging logic...
  } catch (metaError) {
    // Last resort error handling
    console.error('[ERROR LOGGER] Meta-error in error logging system:', metaError);
  }
}
```

### 6. Error Authentication Handler Updates

Enhanced `src/lib/error/auth-error-handler.ts`:

```typescript
export function handleAuthError(error: any, options: ErrorHandler = {}): void {
  try {
    // CRITICAL: Intercept empty errors immediately
    const source = `handleAuthError:${opts.context || 'unknown'}-${opts.action || 'unknown'}`;
    if (isEmptyError(error)) {
      error = interceptError(error, source, { ...opts });
    }
    
    // Rest of the error handling logic...
  } catch (metaError) {
    // Last resort error handling
    console.error('[AUTH ERROR HANDLER] Meta-error in error handler:', metaError);
  }
}
```

### 7. Application Initialization

Created `src/components/error/ErrorInterceptorProvider.tsx`:

```typescript
export function ErrorInterceptorProvider({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    // Initialize error interception on client side
    if (typeof window !== 'undefined') {
      initializeErrorInterception();
      console.log('[ErrorInterceptorProvider] Global error interception enabled');
    }
  }, []);
  
  return <>{children}</>;
}
```

And updated `src/app/layout.tsx` to wrap the application:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorInterceptorProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AuthProvider>
                {children}
                <ToastHost />
              </AuthProvider>
            </ErrorBoundary>
          </ToastProvider>
        </ErrorInterceptorProvider>
      </body>
    </html>
  );
}
```

## TypeScript Integration

We created an interface for intercepted errors to maintain type safety:

```typescript
interface InterceptedError extends Error {
  __intercepted?: boolean;
  __source?: string;
  __timestamp?: string;
  __context?: Record<string, any>;
  __diagnostics?: {
    originalType: string;
    hasMessage: boolean;
    hasStack: boolean;
    intercepted: boolean;
    wasEmpty?: boolean;
  };
}
```

## Preventing Circular References

After implementing the above solution, we encountered an issue with circular references in our error handling. Here's how we fixed it:

### 1. Error Interceptor with Recursion Prevention

```typescript
// Flag to prevent recursive console.error handling
let isHandlingConsoleError = false;

// Store the original console methods before any overrides
const originalConsoleError = typeof console !== 'undefined' ? console.error : null;
const originalConsoleWarn = typeof console !== 'undefined' ? console.warn : null;

// Safe console warn function that avoids circular references
function safeConsoleWarn(...args: any[]): void {
  if (originalConsoleWarn) {
    originalConsoleWarn.apply(console, args);
  } else {
    try {
      console.warn(...args);
    } catch (e) {
      // Silent if even this fails
    }
  }
}

// Console.error override with recursion prevention
console.error = function(...args) {
  // Prevent recursive handling
  if (isHandlingConsoleError) {
    if (originalConsoleError) {
      originalConsoleError.apply(console, args);
    }
    return;
  }
  
  try {
    isHandlingConsoleError = true;
    // Process error...
  } finally {
    isHandlingConsoleError = false;
  }
};
```

### 2. Error Logger with Circular Reference Prevention

```typescript
// Disable interceptor temporarily when logging
let isDirectLoggingInProgress = false;

// Store original console.error when module loads
const nativeConsoleError = typeof console !== 'undefined' ? console.error : null;

async logError(error: any, userId?: string, context?: Record<string, any>): Promise<void> {
  try {
    // Prevent circular logging
    if (isDirectLoggingInProgress) {
      console.warn('[ERROR LOGGER] Breaking potential infinite logging loop');
      return;
    }
    
    isDirectLoggingInProgress = true;
    
    // ... error processing logic ...
    
    // Safe console output that avoids triggering our interceptor
    if (nativeConsoleError) {
      nativeConsoleError.call(console, '[ERROR]', errorOutput);
    } else {
      console.warn('[ERROR LOG]', errorOutput);
    }
  } finally {
    isDirectLoggingInProgress = false;
  }
}
```

### 3. Auth Error Handler with Recursion Prevention

```typescript
// Flag to prevent recursive error handling
let isHandlingAuthError = false;

export function handleAuthError(error: any, options: ErrorHandler = {}): void {
  try {
    // Prevent recursive handling
    if (isHandlingAuthError) {
      console.warn('[AUTH ERROR HANDLER] Breaking potential infinite loop');
      return;
    }
    
    isHandlingAuthError = true;
    
    // ... rest of the function ...
  } finally {
    // Always reset the flag
    isHandlingAuthError = false;
  }
}
```

### 4. Enhanced Diagnostics for Debugging

We added detailed debug information throughout the chain to help diagnose issues:

```typescript
console.debug('[AUTH ERROR HANDLER] Processing error', {
  errorType: typeof error,
  isEmpty: isEmptyError(error),
  context: opts.context,
  action: opts.action,
  errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
  timestamp: new Date().toISOString()
});
```

## Benefits of This Approach

1. **Centralized Error Type Checking**: Using `isEmptyError()` as a single source of truth
2. **Layered Interception**: Catching empty errors at all possible entry points
3. **Rich Error Context**: Adding source, timestamp, and diagnostic data
4. **Debug-Friendly**: Detailed console warnings showing where empty errors originate
5. **Zero Empty Objects**: Guaranteed non-empty errors throughout the system
6. **Robust Error Recovery**: meta-error handling prevents cascading failures
7. **Circular Reference Prevention**: Multiple safeguards against infinite loops in error handling
8. **Detailed Diagnostics**: Enhanced diagnostics throughout the error chain

## Testing & Verification

To verify this fix:

1. **Login Page Testing**: Attempt login with various credentials
2. **Console Monitoring**: Watch for `[ERROR INTERCEPTOR]` logs that show empty errors being caught
3. **Error Tracking**: Verify that any errors have proper context and source information
4. **React Developer Tools**: Check error boundaries to ensure they receive proper error objects

This multi-layered approach ensures we've eliminated the dreaded `[ERROR] {}` issue once and for all! 