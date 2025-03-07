'use client';

import { showToast } from '@/components/ToastHost';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import React from 'react';
import { convertToAppError, handleError } from './error-handler';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: any[];
  showReloadButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary for React components
 * 
 * This component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * @example
 * <ErrorBoundary fallback={<ErrorPage />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error
    console.error('Component error:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Convert to AppError and handle
    const appError = convertToAppError(error, 'react_component');
    handleError(appError);
    
    this.setState({
      error,
      errorInfo
    });

    // Show toast notification for the error
    if (error instanceof Error) {
      showToast.error(error.message);
    } else {
      showToast.error('An unexpected error occurred. Please try again.');
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // If any resetKeys changed, reset the error boundary
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">
            We apologize for the inconvenience. The application encountered an unexpected error.
          </p>
          {this.state.error && (
            <div className="mb-4 p-3 bg-gray-100 rounded overflow-auto max-h-40">
              <p className="font-mono text-sm text-gray-800">{this.state.error.toString()}</p>
            </div>
          )}
          <div className="flex gap-4">
            <Button onClick={this.reset} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
            {this.props.showReloadButton && (
              <Button onClick={() => window.location.reload()} className="bg-gray-600 hover:bg-gray-700">
                Reload Page
              </Button>
            )}
          </div>
        </div>
      );
    }

    // Render children normally
    return this.props.children;
  }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * 
 * @example
 * const SafeComponent = withErrorBoundary(MyComponent, <ErrorFallback />);
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
}

/**
 * Simple error component for Next.js error pages
 */
export function ErrorPage({ error }: { error: Error }) {
  const router = useRouter();

  React.useEffect(() => {
    console.error('Page Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-gray-500">{error.message}</p>
      <Button onClick={() => router.refresh()}>Try Again</Button>
    </div>
  );
}
