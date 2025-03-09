'use client';

import AuthErrorMessage from '@/components/auth/AuthErrorMessage';
import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { AuthFormWrapper } from '@/components/auth/shared/AuthFormWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm } from '@/hooks/core/useForm';
import { withAuthFeedback } from '@/lib/auth/authFeedback';
import { authService } from '@/lib/supabase/services/auth/auth.service';
import { emailSchema } from '@/lib/validation/schemas';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';

// Create a schema for email verification
const emailVerificationSchema = z.object({
  email: emailSchema,
});

interface EmailVerificationFormValues {
  email: string;
}

export default function SendVerificationPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { values, handleChange, handleSubmit, errors } = useForm<EmailVerificationFormValues>({
    initialValues: {
      email: '',
    },
    validationSchema: emailVerificationSchema,
    onSubmit: handleSendVerification
  });

  const formSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    handleSubmit(e);
  };

  async function handleSendVerification(formData: EmailVerificationFormValues) {
    try {
      await withAuthFeedback(
        'send-verification',
        async () => {
          const { error: verificationError } = await authService.sendEmailVerification(formData.email);
          if (verificationError) throw verificationError;

          // Update UI with success message even though toast will also show
          setSuccess('Verification email has been sent. Please check your inbox.');
          return { success: true };
        },
        'Verification email has been sent. Please check your inbox.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    }
  }

  return (
    <>
      <AuthFormWrapper
        title="Verify Your Email"
        description="Enter your email address and we'll send you a verification link"
        onSubmitAction={formSubmitHandler}
      >
        {error && <AuthErrorMessage error={{ message: error, name: 'AuthError' }} className="mb-4" />}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md text-sm mb-6 animate-fadeIn">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="pl-10 w-full"
                placeholder="you@example.com"
                inputSize="lg"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Send Verification Link
            </Button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Already verified?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </AuthFormWrapper>
      
      {/* Loading Overlay */}
      <AuthLoadingOverlay />
    </>
  );
} 