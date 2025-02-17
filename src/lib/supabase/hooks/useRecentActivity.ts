import { useQuery } from '@tanstack/react-query';
import { ActivityService } from '../services/activity.service';

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const service = new ActivityService();
      return service.getRecentActivity();
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
} 