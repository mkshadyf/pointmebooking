'use client';

import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { AnalyticsSection } from './components/AnalyticsSection';
import { OverviewSection } from './components/OverviewSection';
 
import { QuickActions } from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
 
export default function BusinessDashboardPage() {
  const { profile } = useAuth();

  if (!profile || profile.role !== 'business') {
    return null;
  }

  return (
    <div className="space-y-6">
      <OverviewSection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsSection />
        <RecentActivity />
      </div>
      <QuickActions />
    </div>
  );
} 