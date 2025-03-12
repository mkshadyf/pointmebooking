'use client';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { interceptError, isEmptyError } from '@/lib/error/error-interceptor';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useAuthContext();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    // Basic client-side validation
    if (!email) {
      setErrorMessage('Email is required');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Detailed debug logging to help diagnose where empty errors appear
      console.debug('[Login] Submitting login form', {
        email,
        timestamp: new Date().toISOString()
      });
      
      const result = await login(email, password);
      
      // Success case is handled by our authentication service
      if (result.success) {
        router.push('/dashboard');
      } else if (result.error) {
        // CRITICAL: Intercept empty errors immediately
        const source = 'LoginPage:resultError';
        
        // Detailed debug logging to help diagnose where empty errors appear
        console.debug('[Login] Error detected in result.error', {
          errorType: typeof result.error,
          isEmpty: isEmptyError(result.error),
          errorKeys: result.error && typeof result.error === 'object' ? Object.keys(result.error) : [],
          timestamp: new Date().toISOString(),
          hasStack: !!result.error?.stack,
          email: email
        });
        
        if (isEmptyError(result.error)) {
          console.warn('[Login] Empty error object detected in result.error, intercepting', {
            email: email,
            stack: new Error().stack,
            currentUrl: typeof window !== 'undefined' ? window.location.href : '',
            timestamp: new Date().toISOString()
          });
          
          result.error = interceptError(
            result.error, 
            source,
            { 
              email: email, 
              action: 'signIn-resultError',
              detectionPoint: 'result.error check',
              timestamp: new Date().toISOString()
            }
          );
        }
      }
    } catch (error) {
      console.error('[Login] Unexpected error during login', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {errorMessage && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {errorMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
