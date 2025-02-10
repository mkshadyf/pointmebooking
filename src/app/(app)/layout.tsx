'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ReactNode, Suspense } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { profile, loading } = useAuth();
  const role = profile?.role || 'customer';

  if (loading) {
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
      <DashboardLayout role={role}>
        {children}
      </DashboardLayout>
    </Suspense>
  );
}


