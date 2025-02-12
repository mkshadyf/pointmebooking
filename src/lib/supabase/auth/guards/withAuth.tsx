'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    allowedRoles?: Array<'customer' | 'business' | 'admin'>;
  } = {}
) {
  return function WithAuthWrapper(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { redirectTo = '/login', allowedRoles } = options;

    useEffect(() => {
      if (!loading && !user) {
        router.replace(redirectTo);
      }

      if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace('/unauthorized');
      }
    }, [user, loading, router, redirectTo, allowedRoles]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 