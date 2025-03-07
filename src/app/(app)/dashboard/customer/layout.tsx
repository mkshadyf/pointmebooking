'use client';

import { Navigation } from '@/components/navigation';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/hooks/auth/useAuth';
import { redirect } from 'next/navigation';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoading && (!user || profile?.role !== 'customer')) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation type="dashboard" />
      <div className="flex-1 p-6 lg:p-8">{children}</div>
    </div>
  );
} 