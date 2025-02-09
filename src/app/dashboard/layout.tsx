'use client';

import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import React from 'react';

interface DashboardLayoutPageProps {
  children: React.ReactNode;
}

export default function DashboardLayoutPage({ children }: DashboardLayoutPageProps) {
  const { profile } = useAuth();
  const dashboardRole: 'business' | 'customer' = profile?.role === 'business' ? 'business' : 'customer';

  return (
    <DashboardLayout role={dashboardRole}>
      {children}
    </DashboardLayout>
  );
} 