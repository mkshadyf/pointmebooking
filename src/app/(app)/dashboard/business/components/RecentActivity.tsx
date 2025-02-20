'use client';

import { Card } from '@/components/ui/Card';
import { CardContent } from '@/components/ui/CardContent';
import { CardHeader } from '@/components/ui/CardHeader';
import { CardTitle } from '@/components/ui/CardTitle';
import { useAuth } from '@/lib/supabase';
import { useRecentActivity } from '@/lib/supabase/hooks/useRecentActivity';

const RecentActivity: React.FC = () => {
  useAuth();

  const { data, loading, error } = useRecentActivity();

  if (loading) {
    return <div>Loading recent activity...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ul>
            {data.map((activity, index) => (
              <li key={index}>
                {/* Adjust this based on your Activity interface */}
                {activity.timestamp} - {activity.title} - {activity.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity; 