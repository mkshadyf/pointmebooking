'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import MainNav from '@/components/navigation/MainNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const PUBLIC_ROUTES = [
  '/',
  '/services',
  '/businesses',
  '/login',
  '/signup',
  '/verify-email',
  '/auth/verify'
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    if (!auth.loading) {
      const handleAuthCheck = async () => {
        const isPublic = PUBLIC_ROUTES.includes(pathname) || 
                        pathname.startsWith('/auth') || 
                        pathname.startsWith('/verify');

        if (isPublic) return;

        if (!auth.user) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!auth.isEmailVerified && !pathname.startsWith('/verify-email')) {
          router.replace('/verify-email');
          return;
        }

        if (auth.profile?.role === 'business' && 
            !auth.profile.onboarding_completed && 
            !pathname.startsWith('/onboarding')) {
          router.replace('/onboarding/business');
        }

        if (pathname === '/dashboard') {
          const dashboardPath = auth.profile?.role === 'business' 
                              ? '/dashboard/business' 
                              : '/dashboard/customer';
          router.replace(dashboardPath);
        }
      };

      handleAuthCheck();
    }
  }, [auth, pathname, router]);

  if (!mounted || auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="lg" />
      </div>
    );
  }

  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}