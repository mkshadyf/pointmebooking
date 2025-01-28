'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {Sidebar} from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect if not authenticated or not a business user
    if (!loading && (!user || profile?.role !== 'business')) {
      router.push('/login');
    }
  }, [user, profile, loading, router]);

  // Get the page title from the current path
  const getTitle = () => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // Handle special cases
    if (lastSegment === 'business') {
      return 'Business Dashboard';
    }
    
    // Capitalize and format the title
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render anything if not authenticated or not a business user
  if (!user || profile?.role !== 'business') {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="lg:pl-72">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle()}
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
