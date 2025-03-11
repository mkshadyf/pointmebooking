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

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  
  const onSubmit = async (data: LoginFormData) => {
    // Clear any previous errors
    setErrorMessage(null);
    setIsSubmitting(true);
    
    try {
      const { error } = await auth.signInWithEmail(data.email, data.password);
      
      if (!error) {
        // Successful login - redirect to dashboard
        router.push('/dashboard');
      } else {
        // Failed login - display error message
        setErrorMessage(error.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      // This should rarely happen since auth service handles errors internally
      console.error('Unexpected error during login:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    
    try {
      const { error } = await auth.signInWithGoogle();
      
      if (!error) {
        router.push('/dashboard');
      } else {
        setErrorMessage(error.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setErrorMessage('An unexpected error occurred during Google sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <AuthLoadingOverlay />
      
      <div className="w-full max-w-md space-y-8">
        <AuthLogo />
        
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
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
                  {...register('email', { required: 'Email is required' })}
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
                  autoComplete="current-password"
              required
                  {...register('password', { required: 'Password is required' })}
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
        
            <div className="flex items-center justify-between">
          <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  {...register('rememberMe')}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
              </div>
              
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
          </div>
        </div>
        
          <div className="space-y-4">
        <Button
          type="submit"
              className="w-full"
              disabled={auth.isLoading || isSubmitting}
            >
              Sign in
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
          Sign in with Google
        </Button>
        </div>
        </form>
      </div>
    </div>
  );
}
