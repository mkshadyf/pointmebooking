'use client';

import { Card } from '@/components/ui/card';
import { useBusinessMetrics } from '@/lib/supabase/hooks/useBusinessMetrics';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function AnalyticsSection() {
  const { data, isLoading } = useBusinessMetrics();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="h-64">
        {isLoading ? (
          <div className="h-full bg-gray-100 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.revenueByPeriod || []}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
} 