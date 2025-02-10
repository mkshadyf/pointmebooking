'use client';

import { signInAction, signInWithGoogleAction } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setError('Login request timed out. Please check your connection and try again.');
        setLoading(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await signInAction(formData);

      if (response.error) {
        setError(response.error.toString());
        setLoading(false);
        return;
      }

      if (response.redirectTo) {
        // If there's a redirectTo in the URL and it's a relative path, use it
        const finalRedirect = (redirectTo && redirectTo.startsWith('/')) 
          ? redirectTo 
          : response.redirectTo;
        router.push(finalRedirect);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await signInWithGoogleAction();

      if (response.error) {
        setError(response.error.toString());
        setLoading(false);
        return;
      }

      if (response.redirectTo) {
        router.push(response.redirectTo);
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        onClick={handleGoogleSignIn}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M24 9.5c3.2 0 5.9 1.4 7.7 2.6l5.7-5.5C33.2 3.7 28.8 1 24 1 14.3 1 6.3 6.4 2.4 14.3l6.6 5.2C10.3 13.1 16.2 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.5c-.5 2.7-2 5-4.4 6.6l7 5.4c4-3.7 6.3-9.2 6.3-15z"/>
          <path fill="#FBBC05" d="M10.9 28.9c-.8-2-1.3-4.1-1.3-6.3 0-2.2.5-4.3 1.3-6.3l-6.6-5.2C3.2 16.4 2 20.6 2 24s1.2 7.6 4.3 10.7l4.6-5.8z"/>
          <path fill="#EA4335" d="M24 47c6.5 0 11.9-2.1 15.9-5.8l-7.7-5.9c-2.2 1.5-5 2.4-8.2 2.4-6.3 0-11.7-4.3-13.6-10.1L3.2 37.3C7.2 43.1 14.2 47 24 47z"/>
        </svg>
        Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Don't have an account?</span>{' '}
        <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
