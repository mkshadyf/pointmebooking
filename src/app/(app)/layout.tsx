'use client';

import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MainNav from '@/components/navigation/MainNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user, profile, isEmailVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip redirects for auth and public routes
    if (pathname.startsWith('/auth') || pathname === '/' || pathname === '/services' || pathname === '/businesses') {
      return;
    }

    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!isEmailVerified) {
        router.push('/verify-email');
        return;
      }

      // Handle business routes
      if (pathname.startsWith('/dashboard/business')) {
        if (profile?.role !== 'business') {
          router.push('/dashboard/customer');
          return;
        }

        if (!profile.onboarding_completed && pathname !== '/onboarding/business') {
          router.push('/onboarding/business');
          return;
        }
      }

      // Handle customer routes
      if (pathname.startsWith('/dashboard/customer') && profile?.role !== 'customer') {
        router.push('/dashboard/business');
        return;
      }
    }
  }, [loading, user, profile, isEmailVerified, pathname, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Don't show MainNav in business dashboard
  const showMainNav = !pathname.startsWith('/dashboard/business');

  return (
    <div className="min-h-screen bg-gray-50">
      {showMainNav && <MainNav />}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
