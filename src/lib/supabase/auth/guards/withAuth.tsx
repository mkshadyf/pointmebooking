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
    const { user,   isLoading } = useAuth();
    const router = useRouter();
    const { redirectTo = '/login', allowedRoles } = options;

    useEffect(() => {
      if (!isLoading && !user) {
        router.replace(redirectTo);
      }

      if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace('/unauthorized');
      }
    }, [user, isLoading, router, redirectTo, allowedRoles]);

    if (isLoading) {
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

 