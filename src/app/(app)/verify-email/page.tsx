'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { EmailService } from '@/lib/services/email';
import { notify } from '@/lib/utils/notifications';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      notify.success('EMAIL_VERIFICATION_SUCCESS');
      
      // Redirect to appropriate page
      router.push(ROUTES.customerDashboard.path);
    } catch (error) {
      notify.error('EMAIL_VERIFICATION_FAILED', { error: error as Error });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;

    setResending(true);
    try {
      const emailService = EmailService.getInstance();
      await emailService.sendVerificationEmail(user.email);
      notify.success('EMAIL_VERIFICATION_SENT');
    } catch (error) {
      notify.error('EMAIL_VERIFICATION_FAILED', { error: error as Error });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a verification code to your email.
          Please enter it below to verify your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <Input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="uppercase"
                  placeholder="Enter verification code"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !code}
                loading={loading}
              >
                Verify Email
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Didn't receive the code?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={resending}
                loading={resending}
              >
                Resend Code
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 