import { supabase } from '@/lib/supabase'; //  adjust path if necessary
import { Activity } from '@/types/database'; // Import the Activity type
import { useEffect, useState } from 'react';

export function useRecentActivity() {
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      setError(null);

      const { data: recentActivity, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (recentActivity) {
        const mappedActivity: Activity[] = recentActivity.map((item) => ({
          id: item.id,
          title: `Booking ${item.id}`,
          description: `Booking for ${item.customer_name} on ${item.date}`,
          timestamp: item.created_at || new Date().toISOString(),
          type: 'booking',
          status: item.status,
          metadata: {
            customer_name: item.customer_name,
            date: item.date,
            service_id: item.service_id
          },
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        }));
        setData(mappedActivity);
      }

      setLoading(false);
    };

    fetchRecentActivity();
  }, []);

  return { data, loading, error };
}