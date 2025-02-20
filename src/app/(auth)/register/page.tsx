'use client';

import { AuthForm, AuthFormData, AuthWrapper } from '@/components/auth';
import { AuthService } from '@/lib/supabase/services/auth.service';
import { AuthRole } from '@/types/database/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await AuthService.register({
        email: data.email,
        password: data.password,
        role: data.role as AuthRole
      });
      router.push('/login');
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Create your account"
      description={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        fields={[
          {
            name: 'email',
            label: 'Email address',
            type: 'email',
            required: true
          },
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: true
          },
          {
            name: 'role',
            label: 'Account Type',
            type: 'select',
            required: true,
            options: [
              { value: 'customer', label: 'Customer' },
              { value: 'business', label: 'Business' }
            ]
          }
        ]}
        submitText="Create account"
      />
    </AuthWrapper>
  );
}
