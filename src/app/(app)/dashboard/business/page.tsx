'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { AnalyticsSection } from './components/AnalyticsSection';
import { OverviewSection } from './components/OverviewSection';
 
import { QuickActions } from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
 
export default function BusinessDashboardPage() {
  const { profile } = useAuth();

  if (!profile || profile.role !== 'business') {
    return null;
  }

  // Get the business ID from the profile
  // In a real implementation, you might need to fetch the business ID from a different source
  const businessId = profile.id; // Using profile ID as business ID for now

  return (
    <div className="space-y-6">
      <OverviewSection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsSection businessId={businessId} />
        <RecentActivity />
      </div>
      <QuickActions />
    </div>
  );
} 