import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'business' | 'customer';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <Header role={role} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 