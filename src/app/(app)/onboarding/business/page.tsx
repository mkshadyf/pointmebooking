'use client';

import BusinessOnboarding from '@/components/onboarding/BusinessOnboarding';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BusinessOnboardingPage() {
  const { user, isLoading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'business') {
        router.push('/dashboard/customer');
      } else if (profile?.onboarding_completed) {
        router.push('/dashboard/business');
      }
    }
  }, [user, isLoading, profile, router]);

  if (isLoading) return <LoadingSpinner />;
  if (!user || user.role !== 'business') return null;

  return (
    <BusinessOnboarding
      onboardingComplete={() => router.push('/dashboard/business')}
    />
  );
} 