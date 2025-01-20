'use client';

import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const mockBookings = [
  {
    id: '1',
    service_id: 's1',
    customer_id: 'c1',
    business_id: 'b1',
    date: '2025-01-25',
    start_time: '10:00',
    status: 'pending',
    created_at: '2025-01-20T15:00:00Z',
    customer: {
      id: 'c1',
      full_name: 'John Doe',
      email: 'john@example.com',
    },
  },
  {
    id: '2',
    service_id: 's2',
    customer_id: 'c2',
    business_id: 'b1',
    date: '2025-01-27',
    start_time: '14:00',
    status: 'confirmed',
    created_at: '2025-01-20T16:00:00Z',
    customer: {
      id: 'c2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
    },
  },
];

export default function BusinessBookings() {
  const { user } = useAuth();
  const { serviceCategories } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState<string | null>(null);

  // Filter bookings for current business
  const businessBookings = mockBookings.filter(
    (booking) => booking.business_id === user?.id
  );

  const getServiceDetails = (serviceId: string) => {
    return serviceCategories
      .flatMap((cat) => cat.services)
      .find((s) => s.id === serviceId);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setLoading(bookingId);
    try {
      // In a real app, this would make an API call to update the booking status
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Booking ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update booking status: ' + error);
    } finally {
      setLoading(null);
    }
  };

  const filteredBookings = businessBookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your business bookings.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {['all', 'pending', 'confirmed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={clsx(
                'px-3 py-2 text-sm font-medium rounded-md',
                filter === tab
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {filteredBookings.map((booking) => {
            const service = getServiceDetails(booking.service_id);

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
                              'bg-green-100 text-green-800':
                                booking.status === 'confirmed',
                              'bg-yellow-100 text-yellow-800':
                                booking.status === 'pending',
                              'bg-red-100 text-red-800':
                                booking.status === 'cancelled',
                            }
                          )}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
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
                        {booking.customer.full_name}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        {booking.customer.email}
                      </p>
                    </div>
                    {booking.status === 'pending' && (
                      <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                        <button
                          onClick={() =>
                            handleStatusChange(booking.id, 'confirmed')
                          }
                          disabled={loading === booking.id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(booking.id, 'cancelled')
                          }
                          disabled={loading === booking.id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No bookings found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? "You don't have any bookings yet."
              : `No ${filter} bookings at the moment.`}
          </p>
        </div>
      )}
    </div>
  );
}
