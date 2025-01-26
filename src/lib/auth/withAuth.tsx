'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: 'business' | 'customer' | 'admin'
) {
  return function WithAuthComponent(props: P) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
        return;
      }

      if (!loading && requiredRole && profile?.role !== requiredRole) {
        router.push('/');
      }
    }, [user, profile, loading, router]);

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!user || (requiredRole && profile?.role !== requiredRole)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
