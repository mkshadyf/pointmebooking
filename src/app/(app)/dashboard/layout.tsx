'use client';

import { DashboardLayout } from '@/layouts/DashboardLayout';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface DashboardLayoutPageProps {
  children: ReactNode;
}

export default function DashboardLayoutPage({ children }: DashboardLayoutPageProps) {
  const pathname = usePathname();
  
  // Determine the role based on the path
  const role = pathname?.includes('/dashboard/business') ? 'business' : 'customer';

  return (
    <DashboardLayout role={role}>
      {children}
    </DashboardLayout>
  );
}
