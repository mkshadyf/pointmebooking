import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '../services/analytics.service';

export function useBusinessMetrics() {
  return useQuery({
    queryKey: ['business-metrics'],
    queryFn: async () => {
      const service = new AnalyticsService();
      return service.getBusinessMetrics();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 