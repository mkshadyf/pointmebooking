'use client';

import BusinessOnboardingWizard from '@/components/onboarding/BusinessOnboardingWizard';
import { useAuth } from '@/hooks/auth/useAuth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Business onboarding page
 * This page guides users through the process of creating a business profile
 */
export default function BusinessOnboardingPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  
  // Check auth status and redirect if needed
  useEffect(() => {
    if (!isLoading) {
      // If user is not logged in, redirect to login
      if (!user) {
        router.push('/login?redirectTo=/onboarding/business');
        return;
      }
      
      // If user already has completed business onboarding, redirect to dashboard
      if (profile?.role === 'business' && profile?.onboarding_completed) {
        router.push('/dashboard/business');
        return;
      }
      
      setPageLoading(false);
    }
  }, [user, profile, isLoading, router]);
  
  // Show loading state
  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <BusinessOnboardingWizard />
    </div>
  );
} 