# Error Handling System

This directory contains the consolidated error handling system for the application. It provides a centralized way to create, handle, and process errors throughout the application.

## Key Components

### Error Types

- **ErrorCode**: Standardized error codes for different error types
- **ErrorCategory**: Classification of errors by category
- **ErrorSeverity**: Classification of errors by severity

### Error Interface

- **AppError**: Standard error interface used throughout the application

### Error Creation Functions

- **createAppError**: Create a standard AppError
- **createValidationError**: Create a validation error
- **createAuthError**: Create an authentication error
- **createAuthorizationError**: Create an authorization error
- **createNotFoundError**: Create a not found error
- **createDatabaseError**: Create a database error
- **createInternalError**: Create an internal error
- **createRateLimitError**: Create a rate limit error

### Error Handling Functions

- **handleApiError**: Handle API errors
- **handleAuthError**: Handle authentication errors
- **handleClientError**: Handle client-side errors
- **handleError**: General error handling function
- **apiErrorHandler**: Handle errors in API routes
- **formatErrorForResponse**: Format an error for API response
- **getStatusCodeForError**: Get a status code for an error category

### Error Utility Functions

- **isAppError**: Check if an error is an AppError
- **convertToAppError**: Convert any error to an AppError

### Error Components

- **ErrorBoundary**: React error boundary component
- **withErrorBoundary**: HOC to wrap components with an error boundary

## Usage

```typescript
import { 
  createAppError, 
  ErrorCategory, 
  ErrorSeverity,
  handleApiError 
} from '@/lib/error';

// Create a custom error
const error = createAppError(
  'Something went wrong',
  'custom/error-code',
  ErrorCategory.INTERNAL,
  ErrorSeverity.ERROR
);

// Handle an API error
try {
  // API call
} catch (error) {
  const appError = handleApiError(error);
  // Handle the error
}
```

## Error Categories

- **VALIDATION**: Errors related to input validation
- **AUTHENTICATION**: Errors related to authentication
- **AUTHORIZATION**: Errors related to authorization
- **NOT_FOUND**: Errors related to resources not found
- **INTERNAL**: Internal server errors
- **NETWORK**: Network-related errors
- **DATABASE**: Database-related errors
- **RATE_LIMIT**: Rate limiting errors
- **EXTERNAL_SERVICE**: Errors from external services
- **USER_INPUT**: Errors related to user input
- **SECURITY**: Security-related errors

## Error Severities

- **INFO**: Informational messages
- **WARNING**: Warning messages
- **ERROR**: Error messages
- **CRITICAL**: Critical error messages

## Integration with Other Systems

The error handling system integrates with:

- **API Routes**: Using `apiErrorHandler` to handle errors in API routes
- **React Components**: Using `ErrorBoundary` to catch errors in React components
- **Authentication**: Using `handleAuthError` to handle authentication errors
- **Client-Side Code**: Using `handleClientError` to handle client-side errors
- **Notification System**: Using `formatErrorForResponse` to format errors for notifications 