'use client';

import { PageLoading } from '@/components/ui/Loading';
import { ROUTES } from '@/config/routes';
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
        // Not authenticated
        if (!user) {
          router.push(ROUTES.login.path);
          return;
        }

        if (!profile) {
          router.push(ROUTES.login.path);
          return;
        }

        // Email verification check
        if (requireVerified && !profile.email_verified) {
          router.push(ROUTES.verifyEmail.path);
          return;
        }

        // Role access check
        if (allowedRoles && !allowedRoles.includes(profile.role)) {
          // Redirect to appropriate dashboard based on role
          if (profile.role === 'business') {
            router.push(ROUTES.businessDashboard.path);
          } else {
            router.push(ROUTES.customerDashboard.path);
          }
          return;
        }

        // Onboarding check for business users
        if (requireOnboarding && profile.role === 'business' && !profile.onboarding_completed) {
          router.push(ROUTES.businessOnboarding.path);
          return;
        }
      }
    }, [user, profile, loading, router]);

    if (loading || !user || !profile) {
      return <PageLoading />;
    }

    // Extra role check to prevent any possibility of wrong content display
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      return <PageLoading />;
    }

    return <WrappedComponent {...props} />;
  };
}
