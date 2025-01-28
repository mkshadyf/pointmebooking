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

      // Handle email verification
      if (!isEmailVerified && !pathname.startsWith('/verify-email')) {
        router.push('/verify-email');
        return;
      }

      // Handle onboarding
      if (profile?.role === 'business' && !profile.onboarding_completed && !pathname.startsWith('/onboarding')) {
        router.push('/onboarding/business');
        return;
      }
    }
  }, [loading, user, profile, isEmailVerified, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't show loading for public routes
  if (pathname.startsWith('/auth') || pathname === '/' || pathname === '/services' || pathname === '/businesses') {
    return children;
  }

  // Show loading for protected routes until we have user data
  if (!user || (profile?.role === 'business' && !profile.onboarding_completed)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
