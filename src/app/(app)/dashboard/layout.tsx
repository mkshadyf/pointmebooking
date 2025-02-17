import { DashboardHeader } from '@/components/dashboard/Header';
import { MobileNavigation } from '@/components/dashboard/MobileNavigation';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader />
        
        {/* Mobile Navigation */}
        < MobileNavigation  />
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 