'use client';

import { showToast } from '@/components/ToastHost';
import { AppError } from '@/lib/errors/handlers';
import { ErrorCode } from '@/lib/errors/types';
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Show error toast
    if (error instanceof AppError) {
      showToast.error(error.message);
    } else {
      showToast.error('An unexpected error occurred');
    }

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error logging service
      console.error('Error Boundary Caught Error:', {
        error,
        errorInfo,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.error) {
      // Check if it's our AppError
      if (this.state.error instanceof AppError) {
        return this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            resetError={() => this.setState({ error: null, errorInfo: null })}
          />
        );
      }

      // For unknown errors, create an AppError
      const appError = new AppError(ErrorCode.UNKNOWN_ERROR, {
        originalError: this.state.error.message,
        componentStack: this.state.errorInfo?.componentStack
      });

      return this.props.fallback || (
        <ErrorFallback
          error={appError}
          resetError={() => this.setState({ error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: AppError;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <p className="text-4xl font-bold tracking-tight text-red-600 sm:text-5xl">
            {error.status}
          </p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {error.name}
              </h1>
              <p className="mt-1 text-base text-gray-500">{error.message}</p>
              {error.context && (
                <div className="mt-3">
                  <details className="text-sm text-gray-500">
                    <summary>Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <button
                onClick={resetError}
                className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Go home
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
