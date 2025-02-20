'use client';

import { AuthFormWrapper } from '@/components/auth/shared/AuthFormWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Handle login logic
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper
      title="Sign In"
      description="Access your account"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/forgot-password" className="text-primary hover:text-primary/80">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <Link href="/register" className="text-primary hover:text-primary/80">
            Sign up
          </Link>
        </div>
      </div>
    </AuthFormWrapper>
  );
}
