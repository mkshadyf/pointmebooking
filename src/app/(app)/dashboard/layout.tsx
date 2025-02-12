'use client';

import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

type UserRole = 'customer' | 'business';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const role = (user?.role || 'customer') as UserRole;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed position */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content */}
      <div className="lg:pl-64">
        <Header 
          role={role}
          onMobileMenuClick={() => setSidebarOpen(true)}
        />
        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  );
} 