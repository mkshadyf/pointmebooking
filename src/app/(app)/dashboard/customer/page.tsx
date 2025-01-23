'use client';

import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  ClockIcon, 
 
  BuildingOfficeIcon,
  StarIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';

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

export default function CustomerDashboard() {
  const { user, profile } = useAuth();
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here&apos;s what&apos;s happening with your appointments
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className="absolute bg-primary rounded-md p-3">
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href="/services" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Book a Service</p>
                <p className="text-sm text-gray-500">Find and book new services</p>
              </Link>
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
            <div className="flex-shrink-0">
              <StarIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href="/dashboard/customer/favorites" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">My Favorites</p>
                <p className="text-sm text-gray-500">View your favorite services and businesses</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Bookings</h2>
            <Link
              href="/dashboard/customer/bookings"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {customerBookings.map((booking) => {
                const service = getServiceDetails(booking.service_id);
                const business = getBusinessDetails(booking.business_id);

                return (
                  <li key={booking.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
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
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {service?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {business?.business_name}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2">
                          <span
                            className={classNames(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
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
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {format(new Date(booking.date), 'MMM d, yyyy')}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {booking.start_time}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <button
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            Reschedule
                            <ArrowPathIcon className="ml-2 -mr-0.5 h-4 w-4" />
                          </button>
                          <button
                            className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Cancel
                            <XMarkIcon className="ml-2 -mr-0.5 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
