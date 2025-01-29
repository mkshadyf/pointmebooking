'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type UserRole = 'business' | 'customer' | 'admin';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole | UserRole[]
) {
  return function WithAuthComponent(props: P) {
    const auth = useAuth();
    const { user, profile, loading, isEmailVerified } = auth;
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        // Handle unauthenticated users
        if (!user) {
          router.replace('/login');
          return;
        }

        // Handle unverified emails
        if (!isEmailVerified) {
          router.replace('/verify-email');
          return;
        }

        // Handle role-based access
        if (allowedRoles) {
          const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
          if (!profile?.role || !roles.includes(profile.role as UserRole)) {
            // Redirect based on user's role
            if (profile?.role === 'business') {
              router.replace('/dashboard/business');
            } else if (profile?.role === 'customer') {
              router.replace('/dashboard/customer');
            } else {
              router.replace('/');
            }
            return;
          }
        }

        // Handle incomplete business onboarding
        if (profile?.role === 'business' && !profile.onboarding_completed) {
          router.replace('/onboarding/business');
          return;
        }
      }
    }, [user, profile, loading, isEmailVerified, router]);

    // Show loading state
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    // Don't render if not authenticated or not authorized
    if (!user || !isEmailVerified) {
      return null;
    }

    if (allowedRoles && profile) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (!roles.includes(profile.role as UserRole)) {
        return null;
      }
    }

    // Render component if all checks pass
    return <WrappedComponent {...props} />;
  };
}
