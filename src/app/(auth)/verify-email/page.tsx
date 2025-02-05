'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email!,
      });

      if (error) throw error;

      setSuccess('Verification email has been resent!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Verify your email</h1>
        <p className="text-gray-600 mt-2">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
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

      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Didn't receive the email?{' '}
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Click here to resend'}
          </button>
        </p>
      </div>
    </div>
  );
}
