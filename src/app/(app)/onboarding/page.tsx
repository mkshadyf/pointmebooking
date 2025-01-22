'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import BusinessOnboarding  from '@/components/onboarding/BusinessOnboarding';
import { PageLoading } from '@/components/ui/Loading';

export default function OnboardingPage() {
  const { user, loading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'business') {
        router.push('/dashboard/customer');
      } else if (profile?.onboarding_completed) {
        router.push('/dashboard/business');
      }
    }
  }, [user, loading, profile, router]);

  if (loading) return <PageLoading />;
  if (!user || user.role !== 'business') return null;

  return <BusinessOnboarding />;
}
