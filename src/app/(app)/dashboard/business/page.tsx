'use client';

import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Bookings', stat: '12', icon: CalendarIcon },
  { name: 'Active Services', stat: '4', icon: ClockIcon },
  { name: 'Total Revenue', stat: '$1,200', icon: CurrencyDollarIcon },
  { name: 'Total Customers', stat: '8', icon: UserGroupIcon },
];

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { serviceCategories } = useAppStore();

  // Get services for this business
  const businessServices = serviceCategories
    .flatMap((cat) => cat.services)
    .filter((service) => service.business_id === user?.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 rounded-lg overflow-hidden shadow"
              >
                <dt>
                  <div className="absolute bg-primary rounded-md p-3">
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Recent Services */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Your Services</h2>
          <Link
            href="/dashboard/business/services"
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {businessServices.map((service) => (
            <div
              key={service.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ${service.price}
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service.duration} min
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    href={`/services/${service.id}`}
                    className="font-medium text-primary hover:text-primary/90"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {businessServices.length === 0 && (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No services yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by adding services to your business profile.
                </p>
                <Link
                  href="/dashboard/business/services/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                >
                  Add Service
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/business/services/new"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Add a new service
            </span>
          </Link>
          <Link
            href="/dashboard/business/settings"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Update business profile
            </span>
          </Link>
          <Link
            href="/dashboard/business/bookings"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">
              View all bookings
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
