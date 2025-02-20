'use client';

import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { Suspense } from 'react';
 

export default function AppLayout() {
  const { isLoading } = useAuth();

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
     
    </Suspense>
  );
}


