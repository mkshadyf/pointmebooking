'use client';

import { AuthForm, AuthWrapper } from '@/components/auth/shared';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: { email: string; password: string; role: string }) => {
    setIsLoading(true);
    setError('');

    try {
      await register(formData.email, formData.password, formData.role as 'customer' | 'business');
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
          <Link href="/login" className="font-semibold leading-6 text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm
        onSubmit={(data) => handleSubmit(data as { email: string; password: string; role: string })}
        isLoading={isLoading}
        error={error}
        fields={[
          {
            id: 'email',
            label: 'Email address',
            type: 'email',
            required: true
          },
          {
            id: 'password',
            label: 'Password',
            type: 'password',
            required: true
          },
          {
            id: 'role',
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
