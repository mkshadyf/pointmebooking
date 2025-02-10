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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed inset-y-0 left-0 w-72 bg-white shadow-lg z-30"
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col lg:pl-72">
        {/* Header */}
        <Header role={role} onMobileMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-6">
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
    </div>
  );
} 