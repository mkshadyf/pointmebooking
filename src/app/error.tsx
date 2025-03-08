'use client';

import { Button } from '@/components/ui/Button';
import { logError } from '@/lib/error/error-logger';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error component for Next.js
 * This component is used by Next.js to display errors that occur during rendering
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to our error logging service
    logError(error, undefined, {
      component: 'GlobalErrorComponent',
      digest: error.digest,
      location: window.location.href
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
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
          {error.message && (
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