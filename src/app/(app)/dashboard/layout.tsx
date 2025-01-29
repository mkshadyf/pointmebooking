'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, profile, loading, isEmailVerified } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Protect dashboard routes
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

      if (profile?.role === 'business' && !profile.onboarding_completed) {
        router.replace('/onboarding/business');
        return;
      }

      // Ensure users are in their correct dashboard
      const correctPath = profile?.role === 'business' 
        ? '/dashboard/business'
        : '/dashboard/customer';
        
      if (pathname === '/dashboard') {
        router.replace(correctPath);
      } else if (!pathname.startsWith(correctPath)) {
        router.replace(correctPath);
      }
    }
  }, [user, profile, loading, isEmailVerified, pathname, router]);

  // Get the page title from the current path
  const getTitle = () => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment === 'business' || lastSegment === 'customer') {
      return 'Dashboard';
    }
    
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="lg" />
      </div>
    );
  }

  if (!user || !isEmailVerified || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        userRole={profile.role as 'business' | 'customer'} 
      />
      
      <div className="lg:pl-72">
        <Header 
          title={getTitle()} 
          onMenuClick={() => setSidebarOpen(true)}
          userRole={profile.role as 'business' | 'customer'}
        />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
