'use client';

import { Button } from '@/components/ui/Button';
import { logError } from '@/lib/error/error-logger';
import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Global not found component for Next.js
 * This component is used by Next.js to display 404 errors
 */
export default function NotFound() {
  useEffect(() => {
    // Log the 404 error to our error logging service
    logError(new Error('404 Not Found'), undefined, {
      component: 'NotFoundComponent',
      path: window.location.pathname,
      referrer: document.referrer
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find the page you're looking for. The page may have been moved, deleted, or never existed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/">
                Go to Home
              </Link>
            </Button>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 