'use client';

import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/auth/useAuth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const auth = useAuth();
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Verification token is missing. Please check your email link and try again.');
          setVerifying(false);
          return;
        }
        
        // Use the auth service to verify the email
        try {
          await auth.verifyEmail(token);
          setSuccess(true);
          setVerifying(false);
          
          // Redirect to login page after a delay
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } catch (verifyError: any) {
          setError(verifyError?.message || 'Failed to verify your email. The link may have expired or is invalid.');
          setVerifying(false);
        }
      } catch (error) {
        setError('Failed to verify your email. The link may have expired or is invalid.');
        setVerifying(false);
      }
    };
    
    verifyEmail();
  }, [router, searchParams, auth]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthLoadingOverlay />
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Email Verification</h1>
          <p className="mt-2 text-sm text-gray-600">
            {verifying ? 'Verifying your email...' : success ? 'Your email has been verified!' : 'Email verification failed'}
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  Your email has been successfully verified. You will be redirected to the login page shortly.
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {!verifying && (
            <div className="text-center">
              <Link href="/login">
                <Button
                  type="button"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
