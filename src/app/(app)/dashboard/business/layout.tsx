'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, profile, loading, isEmailVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!isEmailVerified) {
        router.replace('/verify-email');
        return;
      }

      if (profile?.role !== 'business') {
        router.replace('/dashboard/customer');
        return;
      }

      if (profile?.role === 'business' && !profile.onboarding_completed) {
        router.replace('/onboarding/business');
      }
    }
  }, [user, profile, loading, isEmailVerified, pathname, router]);

  // Get the page title from the current path
  const getTitle = () => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment === 'business') {
      return 'Business Dashboard';
    }
    
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !isEmailVerified || profile?.role !== 'business') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        userRole="business"
      />

      <div className="lg:pl-72">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle()}
          userRole="business"
        />

        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
