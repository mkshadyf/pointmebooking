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
import { registerSchema } from '@/lib/validation/schemas';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'customer' | 'business';
  agreeToTerms: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { values, handleChange, handleSubmit, errors } = useForm<RegisterFormValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'customer',
      agreeToTerms: false
    },
    validationSchema: registerSchema,
    onSubmit: handleRegister
  });

  const formSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    handleSubmit(e);
  };

  async function handleRegister(formData: RegisterFormValues) {
    try {
      await withAuthFeedback(
        'register',
        async () => {
          // Step 1: Register the user
          const { data: authData, error: authError } = await authService.register({
            email: formData.email,
            password: formData.password,
            role: formData.role,
          });

          if (authError) throw authError;

          if (authData?.user) {
            const client = await supabaseClientService.getBrowserClient();

            try {
              // Step 2: First check if a profile already exists
              const { data: existingProfile } = await client
                .from('profiles')
                .select('id')
                .eq('user_id', authData.user.id)
                .single();

              // Step 3: If profile exists, update it
              if (existingProfile) {
                const { error: profileError } = await client
                  .from('profiles')
                  .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    role: formData.role,
                    full_name: `${formData.first_name} ${formData.last_name}`.trim()
                  })
                  .eq('id', existingProfile.id);

                if (profileError) throw profileError;
              } else {
                // Step 4: If no profile exists, create one
                const { error: profileError } = await client
                  .from('profiles')
                  .insert({
                    user_id: authData.user.id,
                    email: formData.email,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    role: formData.role,
                    full_name: `${formData.first_name} ${formData.last_name}`.trim()
                  });

                if (profileError) throw profileError;
              }
            } catch (profileErr) {
              console.error('Profile creation/update error:', profileErr);
              // Continue despite profile error, we'll handle it later
            }
          }

          router.push('/login');
          return { success: true };
        },
        'Account created successfully! Please check your email to verify your account.',
        { email: formData.email, role: formData.role }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      await withAuthFeedback(
        'google-signin',
        async () => {
          const client = await supabaseClientService.getBrowserClient();
          const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (error) throw error;
          return { success: true };
        },
        'Connecting to Google...'
      );
    } catch (err) {
      // Error already handled by withAuthFeedback
    }
  };

  return (
    <>
      <AuthFormWrapper
        title="Create your account"
        description="Fill in your details to get started"
        onSubmitAction={formSubmitHandler}
      >
        {error && <AuthErrorMessage error={{ message: error, name: 'AuthError' }} className="mb-4" />}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                required
                autoComplete="given-name"
                value={values.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="w-full"
                placeholder="John"
                inputSize="lg"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                required
                autoComplete="family-name"
                value={values.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className="w-full"
                placeholder="Doe"
                inputSize="lg"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>

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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number (Optional)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="pl-10 w-full"
                placeholder="+1 (555) 123-4567"
                inputSize="lg"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
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
                autoComplete="new-password"
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
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters long with uppercase, lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="pl-10 pr-10 w-full"
                placeholder="••••••••"
                inputSize="lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  id="role-customer"
                  name="role"
                  type="radio"
                  value="customer"
                  checked={values.role === 'customer'}
                  onChange={() => handleChange('role', 'customer')}
                  className="h-5 w-5 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="role-customer" className="ml-2 block text-sm text-gray-700">
                  Customer
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="role-business"
                  name="role"
                  type="radio"
                  value="business"
                  checked={values.role === 'business'}
                  onChange={() => handleChange('role', 'business')}
                  className="h-5 w-5 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="role-business" className="ml-2 block text-sm text-gray-700">
                  Business
                </label>
              </div>
            </div>
            {values.role === 'business' && (
              <p className="text-sm text-blue-600">
                You'll be able to set up your business details after registration.
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={values.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
              I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </span>
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      </AuthFormWrapper>
      
      {/* Loading Overlay */}
      <AuthLoadingOverlay />
    </>
  );
}
