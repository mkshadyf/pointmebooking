'use client';

import AuthErrorMessage from '@/components/auth/AuthErrorMessage';
import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { AuthFormWrapper } from '@/components/auth/shared/AuthFormWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm } from '@/hooks/core/useForm';
import { withAuthFeedback } from '@/lib/auth/authFeedback';
import { authService } from '@/lib/supabase/services/auth/auth.service';
import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { loginSchema } from '@/lib/validation/schemas';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { values, handleChange, handleSubmit, errors } = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema: loginSchema,
    onSubmit: handleLogin
  });

  const formSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    handleSubmit(e);
  };

  async function handleLogin(formData: { email: string; password: string; rememberMe: boolean }) {
    try {
      // Use our enhanced authentication feedback system
      await withAuthFeedback(
        'login', 
        async () => {
          const { error } = await authService.login({
            email: formData.email,
            password: formData.password,
          });
          
          if (error) throw error;
          
          return router.push('/dashboard');
        },
        'Signed in successfully!' // Success message
      );
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await withAuthFeedback(
        'google-signin',
        async () => {
          // For OAuth, we need to use the Supabase client directly
          const client = await supabaseClientService.getBrowserClient();
          const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (error) throw error;
        }
      );
    } catch (err) {
      // Error already handled by withAuthFeedback
    }
  };

  return (
    <>
      <AuthFormWrapper
        title="Sign in to your account"
        description="Enter your credentials below to access your dashboard"
        onSubmitAction={formSubmitHandler}
      >
        {error && <AuthErrorMessage error={{ message: error, name: 'AuthError' }} className="mb-4" />}

        <div className="space-y-4">
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

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="pl-10 pr-10 w-full"
                placeholder="••••••••"
                inputSize="lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={values.rememberMe}
                onChange={(e) => handleChange('rememberMe', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-base font-medium shadow-sm transition-all duration-150 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-6"
            size="lg"
          >
            Sign in
          </Button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors text-base mt-6"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="text-center text-sm mt-8">
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Create an account
          </Link>
        </div>
      </AuthFormWrapper>
      
      {/* Loading Overlay */}
      <AuthLoadingOverlay />
    </>
  );
}
