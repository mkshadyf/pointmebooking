'use client';

import { AuthForm } from '@/components/auth/shared/AuthForm';
import { AuthWrapper } from '@/components/auth/shared/AuthWrapper';

export default function RegisterPage() {
  return (
    <AuthWrapper title="Register" description="">
      <AuthForm />
    </AuthWrapper>
  );
}
