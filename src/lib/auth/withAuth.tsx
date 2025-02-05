'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type UserRole = 'business' | 'customer' | 'admin';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole | UserRole[]
) {
  return function WithAuthComponent(props: P) {
    const { user, profile, loading, isEmailVerified } = useAuth();
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
          if (!profile?.role || !roles.includes(profile.role)) {
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

    if (loading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
