'use client';

import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profile) {
      if (profile.role === 'business') {
        router.push('/dashboard/business');
      } else {
        router.push('/dashboard/customer');
      }
    }
  }, [profile, isLoading, router]);

  if (isLoading) return <LoadingSpinner />;

  return null;
} 