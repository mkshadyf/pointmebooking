'use client';

import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { format } from 'date-fns';
import clsx from 'clsx';

const mockBookings = [
  {
    id: '1',
    service_id: 's1',
    customer_id: 'c1',
    business_id: 'b1',
    date: '2025-01-25',
    start_time: '10:00',
    status: 'confirmed',
    created_at: '2025-01-20T15:00:00Z',
  },
  {
    id: '2',
    service_id: 's2',
    customer_id: 'c1',
    business_id: 'b1',
    date: '2025-01-27',
    start_time: '14:00',
    status: 'pending',
    created_at: '2025-01-20T16:00:00Z',
  },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { serviceCategories, businessCategories } = useAppStore();

  // Filter bookings for current customer
  const customerBookings = mockBookings.filter(
    (booking) => booking.customer_id === user?.id
  );

  const getServiceDetails = (serviceId: string) => {
    return serviceCategories
      .flatMap((cat) => cat.services)
      .find((s) => s.id === serviceId);
  };

  const getBusinessDetails = (businessId: string) => {
    return businessCategories
      .flatMap((cat) => cat.businesses)
      .find((b) => b.id === businessId);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your upcoming appointments and bookings.
        </p>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {customerBookings.map((booking) => {
            const service = getServiceDetails(booking.service_id);
            const business = getBusinessDetails(booking.business_id);

            return (
              <li key={booking.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-primary truncate">
                        {service?.name}
                      </p>
                      <div className="ml-2">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            {
                              'bg-green-100 text-green-800': booking.status === 'confirmed',
                              'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                              'bg-red-100 text-red-800': booking.status === 'cancelled',
                            }
                          )}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.date), 'MMM d, yyyy')} at{' '}
                        {booking.start_time}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {business?.business_name}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        {business?.location}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>Duration: {service?.duration} minutes</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {customerBookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by browsing services and making your first booking.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
          >
            Browse Services
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/services"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Book a new service
            </span>
          </Link>
          <Link
            href="/dashboard/customer/history"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">
              View booking history
            </span>
          </Link>
          <Link
            href="/dashboard/customer/settings"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Update profile
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
