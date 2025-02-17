'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export function DashboardSettings() {
  const [settings, setSettings] = useState({
    showAnalytics: true,
    showRecentActivity: true,
    showQuickActions: true,
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Dashboard Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-analytics"
            checked={settings.showAnalytics}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, showAnalytics: checked }))
            }
          />
          <Label htmlFor="show-analytics">Show Analytics Section</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-recent-activity"
            checked={settings.showRecentActivity}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, showRecentActivity: checked }))
            }
          />
          <Label htmlFor="show-recent-activity">Show Recent Activity</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-quick-actions"
            checked={settings.showQuickActions}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, showQuickActions: checked }))
            }
          />
          <Label htmlFor="show-quick-actions">Show Quick Actions</Label>
        </div>
      </div>
    </Card>
  );
} 