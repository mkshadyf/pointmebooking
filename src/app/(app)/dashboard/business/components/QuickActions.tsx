'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Plus, Settings, Users } from 'lucide-react';

export function QuickActions() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-24 flex-col gap-2">
          <Plus className="h-6 w-6" />
          Add Service
        </Button>
        <Button className="h-24 flex-col gap-2">
          <Calendar className="h-6 w-6" />
          Create Booking
        </Button>
        <Button className="h-24 flex-col gap-2">
          <Users className="h-6 w-6" />
          Manage Staff
        </Button>
        <Button className="h-24 flex-col gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </Button>
      </div>
    </Card>
  );
} 