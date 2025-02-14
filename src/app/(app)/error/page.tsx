'use client';

 
import { ErrorCode, ErrorMessageMap } from '@/lib/supabase/utils/errors';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code') as ErrorCode || ErrorCode.UNKNOWN_ERROR;
  const errorMessage = searchParams.get('message') || ErrorMessageMap[errorCode];
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error logging service
      console.error('Error Page:', {
        code: errorCode,
        message: errorMessage,
        redirectTo
      });
    }
  }, [errorCode, errorMessage, redirectTo]);

  return (
    <div className="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <p className="text-4xl font-bold tracking-tight text-red-600 sm:text-5xl">
            {errorCode.split('/')[1].toUpperCase()}
          </p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {errorCode.split('/')[0].toUpperCase()}
              </h1>
              <p className="mt-1 text-base text-gray-500">{errorMessage}</p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
              <button
                onClick={() => router.push(redirectTo)}
                className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Go back
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 