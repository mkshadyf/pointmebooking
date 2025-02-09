'use client';

import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function BusinessDashboard() {
  const { profile } = useAuth();

  const stats = [
    { name: 'Total Bookings', value: '0', icon: CalendarIcon },
    { name: 'Total Customers', value: '0', icon: UsersIcon },
    { name: 'Revenue', value: formatCurrency(0), icon: ChartBarIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.business_name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-primary/10 p-3">
                  <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
            <div className="mt-4">
              <p className="text-sm text-gray-500">No recent bookings</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Popular Services</h3>
            <div className="mt-4">
              <p className="text-sm text-gray-500">No services yet</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 