'use client';

import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirect based on user role
        router.push(user.role === 'business' ? '/onboarding/business' : '/dashboard/customer');
      }
    }
  }, [user, isLoading, router]);

  if (    isLoading) return <LoadingSpinner />;
  return null; // Page will redirect, no need to render anything
} 