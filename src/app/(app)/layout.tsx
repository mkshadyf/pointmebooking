'use client';

import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { ReactNode, Suspense } from 'react';
import DashboardLayout from './dashboard/layout';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </Suspense>
  );
}


