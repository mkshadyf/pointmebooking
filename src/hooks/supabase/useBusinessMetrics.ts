import { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function useBusinessMetrics(businessId: string | undefined, supabase: SupabaseClient) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: metrics, error: fetchError } = await supabase
          .from('business_metrics')
          .select('total_revenue, total_bookings')
          .eq('business_id', businessId)
          .single();

        if (fetchError) {
          throw fetchError;
        }
        setData(metrics);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [businessId, supabase]);

  return { data, isLoading, error };
}