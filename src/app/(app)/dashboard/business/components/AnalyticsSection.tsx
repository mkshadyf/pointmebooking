'use client';

import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { useBusinessMetrics } from '@/lib/supabase/hooks/useBusinessMetrics';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function AnalyticsSection() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data, isLoading, error } = useBusinessMetrics(userId || '', supabase);

  if (!userId) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}