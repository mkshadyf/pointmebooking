'use client';

import { Button } from '@/components/ui/Button';
import { logError } from '@/lib/error/error-logger';
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error logging service
    logError(error, undefined, {
      componentStack: errorInfo.componentStack,
      location: window.location.href
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} reset={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  reset: () => void;
}

/**
 * Default fallback UI for the ErrorBoundary
 */
function DefaultErrorFallback({ error, reset }: ErrorFallbackProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We've encountered an unexpected error. Our team has been notified and is working to fix the issue.
          </p>
          {error && (
            <div className="p-3 bg-gray-50 rounded-md text-sm text-left mb-4 overflow-auto max-h-[150px]">
              <p className="font-mono text-red-600">{error.message}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default">
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
} 