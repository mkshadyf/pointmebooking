'use client';

import { forgotPasswordAction } from '@/app/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const response = await forgotPasswordAction(formData);

    if (response.error) {
      setError(typeof response.error === 'string' ? response.error : response.error.message);
      setLoading(false);
      return;
    }

    if (response.success) {
      setSuccess(response.success);
    }

    if (response.redirectTo) {
      router.push(response.redirectTo);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Reset your password</h1>
        <p className="text-gray-600 mt-2">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-4 rounded-md text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Sending reset link...' : 'Send reset link'}
        </button>
      </form>

      <div className="text-center text-sm">
        <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
