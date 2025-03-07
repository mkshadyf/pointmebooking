'use client';

import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/hooks/auth/useAuth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CustomerDashboardPage() {
  const { user, profile, isLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // In a real implementation, you would fetch customer appointments
    // For now, we're just simulating loading state
    const timer = setTimeout(() => {
      setAppointments([]);
      setIsLoadingData(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingSpinner />;

  // Get the display name from the profile
  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email || 'Customer';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {displayName}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Upcoming Appointments</h3>
          {isLoadingData ? (
            <LoadingSpinner size="sm" />
          ) : appointments.length > 0 ? (
            <p>You have {appointments.length} upcoming appointments</p>
          ) : (
            <p className="text-sm text-gray-500">No upcoming appointments</p>
          )}
          <div className="mt-4">
            <Link 
              href="/dashboard/customer/appointments"
              className="text-sm text-primary hover:underline"
            >
              View all appointments →
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Favorite Services</h3>
          <p className="text-sm text-gray-500">
            View and manage your favorite services
          </p>
          <div className="mt-4">
            <Link 
              href="/dashboard/customer/favorites"
              className="text-sm text-primary hover:underline"
            >
              View favorites →
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Account Settings</h3>
          <p className="text-sm text-gray-500">
            Manage your profile and preferences
          </p>
          <div className="mt-4">
            <Link 
              href="/dashboard/customer/settings"
              className="text-sm text-primary hover:underline"
            >
              Update settings →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 