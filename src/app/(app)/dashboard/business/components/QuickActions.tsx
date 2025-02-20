'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function QuickActions() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-24">
          Add New Service
        </Button>
        <Button variant="outline" className="h-24">
          View Bookings
        </Button>
        <Button variant="outline" className="h-24">
          Manage Staff
        </Button>
        <Button variant="outline" className="h-24">
          View Reports
        </Button>
      </div>
    </Card>
  );
} 