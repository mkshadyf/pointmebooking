'use client';

import { SessionChecker } from '@/components/auth';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/hooks/auth/useAuth';
import { Suspense } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

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
      {/* Add SessionChecker when authenticated */}
      {isAuthenticated && <SessionChecker checkIntervalMinutes={10} silentRefresh={true} />}
      
      {/* Render main content */}
      {children}
    </Suspense>
  );
}


