'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MainNav from '@/components/navigation/MainNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const PUBLIC_ROUTES = ['/', '/services', '/businesses', '/login', '/signup', '/verify-email'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isEmailVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/auth');

  useEffect(() => {
    let isMounted = true;
    if (isPublicRoute) return;

    const handleAuth = async () => {
      if (!loading) {
        if (!user) {
          if (isMounted) router.replace('/login');
          return;
        }
        if (!isEmailVerified && !pathname.startsWith('/verify-email')) {
          if (isMounted) router.replace('/verify-email');
          return;
        }
        if (profile?.role === 'business' && !profile.onboarding_completed && !pathname.startsWith('/(app)/onboarding')) {
          if (isMounted) router.replace('/(app)/onboarding/business');
          return;
        }
        if (pathname === '/dashboard') {
          if (isMounted) {
            if (profile?.role === 'business') {
              router.replace('/(app)/dashboard/business');
            } else {
              router.replace('/(app)/dashboard/customer');
            }
          }
        }
      }
    };

    handleAuth();
    return () => { isMounted = false; };
  }, [loading, user, profile, isEmailVerified, pathname, router, isPublicRoute]);

  if (isPublicRoute) return children;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 shadow bg-white">
        <MainNav />
      </header>
      <main className="flex-1 pt-20 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        {children}
      </main>
      <footer className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
      </footer>
    </div>
  );
}
