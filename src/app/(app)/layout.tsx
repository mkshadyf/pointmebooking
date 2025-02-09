'use client';

import { Navigation } from '@/components/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_ROUTES = ['/', '/services', '/businesses', '/login', '/signup', '/verify-email'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isEmailVerified, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/auth');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && !isEmailVerified) {
      router.push('/verify-email');
    }
  }, [user, loading, isEmailVerified, router]);

  if (isPublicRoute) return children;
  if (loading || !user || !isEmailVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 shadow bg-white">
        <Navigation type="dashboard" />
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
