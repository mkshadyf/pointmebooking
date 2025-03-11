'use client';

import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/auth/useAuth';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: ''
    }
  });
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Clear any previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    
    // Attempt to send password reset email
    const { error } = await auth.resetPassword(data.email);
    
    if (!error) {
      setSuccessMessage('Password reset instructions have been sent to your email.');
    } else {
      setErrorMessage(error.message || 'Failed to send password reset email. Please try again.');
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthLoadingOverlay />
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Forgot your password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
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
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={auth.isLoading || isSubmitting}
            >
              Send Reset Link
            </Button>
            
            <div className="text-center">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
