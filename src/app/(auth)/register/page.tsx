'use client';

import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { AuthLogo } from '@/components/auth/AuthLogo';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/auth/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    }
  });
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormData) => {
    // Clear any previous errors
    setErrorMessage(null);
    setIsSubmitting(true);
    
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    // Attempt to sign up
    const { error } = await auth.signUpWithEmail(data.email, data.password);
    
    if (!error) {
      // Redirect to verification page
      router.push('/send-verification');
    } else {
      setErrorMessage(error.message || 'Failed to create account. Please try again.');
    }
    
    setIsSubmitting(false);
  };
  
  const handleGoogleSignIn = async () => {
    // Clear any previous errors
    setErrorMessage(null);
    setIsSubmitting(true);
    
    // Attempt to sign in with Google
    const { error } = await auth.signInWithGoogle();
    
    if (error) {
      setErrorMessage(error.message || 'Google sign-in failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <AuthLoadingOverlay />
      
      <div className="w-full max-w-md space-y-8">
        <AuthLogo />
        
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
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

            <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
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
            
            <div className="flex items-center">
              <Checkbox
                id="agree-terms"
                {...register('agreeToTerms', { 
                  required: 'You must agree to the terms and conditions'
                })}
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
            )}
        </div>

          <div className="space-y-4">
          <Button
            type="submit"
            className="w-full"
              disabled={auth.isLoading || isSubmitting}
          >
              Create account
          </Button>
            
            <div className="relative">
          <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

            <Button
            type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={auth.isLoading || isSubmitting}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                {/* Google icon */}
                <path
                  d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.123 1.632l2.917-2.917a10.027 10.027 0 00-7.04-2.749 10.087 10.087 0 000 20.172c5.018 0 9.614-3.314 9.614-9.614 0-.508-.043-1.016-.13-1.52z"
                  fill="currentColor"
                />
            </svg>
            Sign up with Google
            </Button>
        </div>
        </form>
      </div>
    </div>
  );
}
