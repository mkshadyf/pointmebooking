'use client';

import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/auth/useAuth';
import Link from 'next/link';
import { useState } from 'react';

export default function SendVerificationPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  
  const handleResendVerification = async () => {
    // Clear any previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    
    try {
      await auth.resendVerification();
      setSuccessMessage('Verification email has been sent. Please check your inbox.');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthLoadingOverlay />
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Verify your email</h1>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification email to your inbox. Please check your email and click the verification link.
          </p>
        </div>
        
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{errorMessage}</div>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{successMessage}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or click below to resend.
            </p>
          </div>
          
          <Button
            type="button"
            className="w-full"
            onClick={handleResendVerification}
            disabled={auth.isLoading || isSubmitting}
          >
            Resend Verification Email
          </Button>
          
          <div className="text-center">
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 