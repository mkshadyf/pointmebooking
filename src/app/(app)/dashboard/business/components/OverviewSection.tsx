'use client';

import { Card } from '@/components/ui/Card';
import { supabase, useAuth } from '@/lib/supabase';
import { useBusinessMetrics } from '@/lib/supabase/hooks/useBusinessMetrics';

export function OverviewSection() {
  const { profile } = useAuth();
  const businessId = profile?.id;

  const { data, isLoading, error } = useBusinessMetrics(businessId, supabase);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !businessId) {
    return <div>Error: {error?.message || "Could not load business ID"}</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Business Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Bookings"
          value={data?.totalBookings || 0}
          isLoading={isLoading}
        />
        <MetricCard
          label="Total Revenue"
          value={`$${data?.totalRevenue || 0}`}
          isLoading={isLoading}
        />
        <MetricCard
          label="Active Services"
          value={data?.activeServices || 0}
          isLoading={isLoading}
        />
        <MetricCard
          label="Customer Rating"
          value={data?.averageRating?.toFixed(1) || '0.0'}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
}

function MetricCard({ label, value, isLoading }: { 
  label: string; 
  value: string | number; 
  isLoading: boolean 
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      {isLoading ? (
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className="text-xl font-semibold">{value}</p>
      )}
    </div>
  );
} 