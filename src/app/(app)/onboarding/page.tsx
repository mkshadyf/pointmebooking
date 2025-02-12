'use client';

import { PageLoading } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirect based on user role
        router.push(user.role === 'business' ? '/onboarding/business' : '/dashboard/customer');
      }
    }
  }, [user, loading, router]);

  if (loading) return <PageLoading />;
  return null; // Page will redirect, no need to render anything
} 