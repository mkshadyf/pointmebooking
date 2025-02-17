'use client';

import { Card } from '@/components/ui/card';
import { useRecentActivity } from '@/lib/supabase/hooks/useRecentActivity';

export function RecentActivity() {
  const { data, isLoading } = useRecentActivity();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))
        ) : (
          data?.map((activity, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activity.type}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
              <p className="text-sm text-gray-500">{activity.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
} 