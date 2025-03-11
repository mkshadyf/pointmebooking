'use client';

import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/auth/useAuth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  
  const password = watch('password');
  
  const onSubmit = async (data: ResetPasswordFormData) => {
    // Clear any previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Get the token from the URL
      const token = searchParams.get('token');
      
      if (!token) {
        setErrorMessage('Password reset token is missing. Please try again or request a new reset link.');
        setIsSubmitting(false);
        return;
      }
      
      // Use the auth service to update the password
      const { error } = await auth.updatePasswordWithToken(token, data.password);
      
      if (!error) {
        setSuccessMessage('Your password has been reset successfully');
        
        // Redirect to login page after a delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setErrorMessage(error.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthLoadingOverlay />
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
              Reset Password
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
