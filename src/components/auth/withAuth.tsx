'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  roles?: string[]
) {
  return function WithAuthComponent(props: P) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth/signin');
      } else if (!loading && roles && !roles.includes(profile?.role || '')) {
        router.push('/dashboard');
      }
    }, [user, profile, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user || (roles && !roles.includes(profile?.role || ''))) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
