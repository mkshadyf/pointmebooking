'use client';

import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ReactNode, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'business' | 'customer';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Header role={role} onMobileMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <p className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} PointMe. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 