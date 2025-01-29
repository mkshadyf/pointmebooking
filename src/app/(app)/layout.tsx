'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import MainNav from '@/components/navigation/MainNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/services', '/businesses', '/login', '/signup', '/verify-email'];

/**
 * AppLayout component that handles authentication and routing
 * @param children - React node to be rendered inside the layout
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Get authentication state and router instance
  const auth = useAuth();
  const { user, profile, loading, isEmailVerified } = auth;
  const router = useRouter();
  const pathname = usePathname() || '';

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/auth');

  // Handle authentication and routing on mount
  useEffect(() => {
    if (isPublicRoute) return;

    const handleAuth = async () => {
      if (!loading) {
        // Redirect to login if not authenticated
        if (!user) {
          router.replace('/login');
          return;
        }

        // Redirect to email verification if not verified
        if (!isEmailVerified && !pathname.startsWith('/verify-email')) {
          router.replace('/verify-email');
          return;
        }

        // Redirect to onboarding if business profile is not completed
        if (profile?.role === 'business' && !profile.onboarding_completed && !pathname.startsWith('/onboarding')) {
          router.replace('/onboarding/business');
          return;
        }

        // Redirect to dashboard based on user role
        if (pathname === '/dashboard') {
          if (profile?.role === 'business') {
            router.replace('/dashboard/business');
          } else if (profile?.role === 'customer') {
            router.replace('/dashboard/customer');
          }
        }
      }
    };

    handleAuth();
  }, [loading, user, profile, isEmailVerified, pathname, router, isPublicRoute]);

  // Return early for public routes
  if (isPublicRoute) {
    return children;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.replace('/login');
    return null;
  }

  // Main layout for authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
