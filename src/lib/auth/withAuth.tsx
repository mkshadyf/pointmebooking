'use client';

import { PageLoading } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { ComponentType, useEffect } from 'react';

interface WithAuthProps {
  allowedRoles?: UserRole[];
  requireVerified?: boolean;
  requireOnboarding?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  { allowedRoles, requireVerified = true, requireOnboarding = true }: WithAuthProps = {}
) {
  return function WithAuthComponent(props: P) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
        router.push('/login');
          return;
      }

        if (requireVerified && !profile?.email_verified) {
        router.push('/verify-email');
          return;
        }

        if (profile) {
          // Check role access
          if (allowedRoles && !allowedRoles.includes(profile.role)) {
            router.push(profile.role === 'business' ? '/dashboard/business' : '/dashboard/customer');
            return;
    }

          // Check onboarding for business users
          if (requireOnboarding && profile.role === 'business' && !profile.onboarding_completed) {
            router.push('/onboarding/business');
            return;
          }
        }
      }
    }, [user, profile, loading, router]);

    if (loading || !user || !profile) {
      return <PageLoading />;
    }

    return <WrappedComponent {...props} />;
};
}
