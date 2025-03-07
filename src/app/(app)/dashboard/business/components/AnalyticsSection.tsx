'use client';

import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function AnalyticsSection({ businessId }: { businessId: string }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;
      
      try {
        setLoading(true);
        const client = await supabaseClientService.getClient();
        
        // Fetch booking metrics
        const { data: bookingData, error: bookingError } = await client
          .from('bookings')
          .select('created_at, status')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });
          
        if (bookingError) {
          console.error('Error fetching booking metrics:', bookingError);
          return;
        }
        
        // Process data for chart
        const processedData = processMetricsData(bookingData || []);
        setMetrics(processedData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [businessId]);

  // Helper function to process metrics data for the chart
  const processMetricsData = (data: any[]) => {
    // Process data for chart display
    // This is a placeholder implementation
    return data.map(item => ({
      date: new Date(item.created_at).toLocaleDateString(),
      bookings: 1,
      status: item.status
    }));
  };

  if (!userId) return null;

  return (
    <Card className="col-span-3">
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Business Analytics</h3>
        </div>
        <div className="mt-4 flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading analytics...</p>
            </div>
          ) : metrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={metrics}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}