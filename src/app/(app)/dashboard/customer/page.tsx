'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/lib/auth/withAuth';
import { useAppStore } from '@/lib/store';
import { classNames } from '@/lib/utils';
import {
    ArrowPathIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    CheckIcon,
    ClockIcon,
    StarIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

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

const stats = [
  { name: 'Total Bookings', value: '12', icon: CalendarIcon },
  { name: 'Completed', value: '8', icon: CheckIcon },
  { name: 'Upcoming', value: '3', icon: ClockIcon },
  { name: 'Favorite Places', value: '5', icon: StarIcon },
];

export default withAuth(function CustomerDashboard() {
  const { user, profile } = useAuth();
  const { serviceCategories, businessCategories } = useAppStore();

  // Filter bookings for current customer
  const customerBookings = mockBookings.filter(
    (booking) => booking.customer_id === user?.id
  );

  const getServiceDetails = (serviceId: string) => {
    return serviceCategories
      .flatMap((cat: { services: any; }) => cat.services)
      .find((s: { id: string; }) => s.id === serviceId);
  };

  const getBusinessDetails = (businessId: string) => {
    return businessCategories
      .flatMap((cat: { businesses: any; }) => cat.businesses)
      .find((b: { id: string; }) => b.id === businessId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16 sm:pt-20"> {/* Account for navigation bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg mb-6">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
            <div className="relative px-6 py-8 sm:px-8 sm:py-12">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Welcome back, {profile?.full_name || 'Customer'}!
                </h1>
                <p className="mt-2 text-lg text-white/90">
                  Here's what's happening with your appointments
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.name}
                  className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
                >
                  <dt>
                    <div className="absolute rounded-md bg-purple-600 p-3">
                      <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/services"
              className="relative flex items-center space-x-4 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 focus:outline-none"
            >
              <div className="flex-shrink-0">
                <CalendarIcon className="h-10 w-10 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Book a Service</p>
                <p className="truncate text-sm text-gray-500">Find and book new services</p>
              </div>
            </Link>

            <Link
              href="/dashboard/customer/favorites"
              className="relative flex items-center space-x-4 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 focus:outline-none"
            >
              <div className="flex-shrink-0">
                <StarIcon className="h-10 w-10 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">My Favorites</p>
                <p className="truncate text-sm text-gray-500">View your favorite services and businesses</p>
              </div>
            </Link>
          </div>

          {/* Recent Bookings */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
              <Link
                href="/dashboard/customer/bookings"
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                View all
              </Link>
            </div>

            <ErrorBoundary fallback={<div className="mt-4 text-red-500">Error loading bookings</div>}>
              <Suspense fallback={<LoadingSpinner className="mt-4" />}>
                <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                  <ul role="list" className="divide-y divide-gray-200">
                    {customerBookings.map((booking) => {
                      const service = getServiceDetails(booking.service_id);
                      const business = getBusinessDetails(booking.business_id);

                      return (
                        <li key={booking.id} className="p-4 sm:p-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {service?.image_url ? (
                                  <div className="relative h-12 w-12">
                                    <Image
                                      src={service.image_url}
                                      alt={service.name}
                                      fill
                                      className="rounded-lg object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {service?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {business?.business_name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="hidden sm:flex flex-col items-end">
                                <p className="text-sm text-gray-900">
                                  {format(new Date(booking.date), 'MMM d, yyyy')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.start_time}
                                </p>
                              </div>
                              <span
                                className={classNames(
                                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''
                                )}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <div className="flex items-center text-sm text-gray-500 sm:mt-0">
                                <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                60 minutes
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-end space-x-4 sm:mt-0">
                              <button
                                className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                              >
                                <ArrowPathIcon className="mr-2 h-4 w-4" />
                                Reschedule
                              </button>
                              <button
                                className="inline-flex items-center justify-center rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100"
                              >
                                <XMarkIcon className="mr-2 h-4 w-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Bottom Spacing */}
          <div className="h-16" /> {/* Add bottom spacing */}
        </div>
      </main>
    </div>
  );
});
