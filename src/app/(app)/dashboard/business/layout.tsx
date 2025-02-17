'use client';

import { DashboardHeader, DashboardSidebar, MobileNavigation } from '@/components/dashboard';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { Suspense } from 'react';

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = useAuth();

  if (!profile || profile.role !== 'business') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <MobileNavigation />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
} 