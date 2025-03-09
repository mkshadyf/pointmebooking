'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!profile || profile.role !== 'admin') {
        router.push('/'); // Redirect to home if not an admin
      }
    }
  }, [authLoading, profile, router]);

  if (authLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Admin dashboard is currently under maintenance.</p>
    </div>
  );
} 