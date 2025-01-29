'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type UserRole = 'business' | 'customer' | 'admin';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole | UserRole[]
) {
  return function WithAuthComponent(props: P) {
    const [mounted, setMounted] = useState(false);
    const auth = useAuth();
    const { user, profile, loading, isEmailVerified } = auth;
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo');

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!loading) {
        const handleAuth = async () => {
          // Handle unauthenticated users
          if (!user) {
            const loginPath = redirectTo 
              ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
              : '/login';
            router.replace(loginPath);
            return;
          }

          // Handle unverified emails
          if (!isEmailVerified) {
            router.replace('/verify-email');
            return;
          }

          // Handle role-based access
          if (allowedRoles && profile?.role) {
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            if (!roles.includes(profile.role as UserRole)) {
              const dashboardPath = profile.role === 'business' 
                ? '/dashboard/business'
                : '/dashboard/customer';
              router.replace(dashboardPath);
              return;
            }
          }

          // Handle incomplete business onboarding
          if (profile?.role === 'business' && !profile.onboarding_completed) {
            router.replace('/onboarding/business');
            return;
          }
        };

        handleAuth();
      }
    }, [user, profile, loading, isEmailVerified, router, redirectTo]);

    // Show loading state
    if (!mounted || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner className="lg" />
        </div>
      );
    }

    // Don't render if not authenticated or not authorized
    if (!user || !isEmailVerified) {
      return null;
    }

    if (allowedRoles && profile?.role) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (!roles.includes(profile.role as UserRole)) {
        return null;
      }
    }

    // Render component if all checks pass
    return <WrappedComponent {...props} />;
  };
}
