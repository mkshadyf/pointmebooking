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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed position */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0"
      />

      {/* Main content wrapper - Margin for sidebar */}
      <div className="flex min-h-screen flex-col lg:pl-72">
        {/* Header - Fixed position */}
        <Header 
          role={role} 
          onMobileMenuClick={() => setSidebarOpen(true)} 
          className="fixed top-0 right-0 left-0 z-30 bg-white shadow lg:left-72"
        />
        
        {/* Main content - Padding for header */}
        <main className="flex-1 px-4 pt-16 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl py-4">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PointMe. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
} 