'use client';

import { useAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Role = 'business' | 'admin' | 'customer'; // Define the Role type

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    allowedRoles?: Array<Role>;
  } = {}
) {
  return function WithAuthWrapper(props: P) {
    const { user, profile, isLoading } = useAuth();
    const router = useRouter();
    const { redirectTo = '/login', allowedRoles } = options;

    useEffect(() => {
        if (isLoading) {
        return;
      }

      if (!user) {
        router.replace(redirectTo);
      }

      if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        router.replace('/unauthorized');
      }
    }, [user, isLoading, router, redirectTo, allowedRoles, profile]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(profile?.role as Role)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

 

 