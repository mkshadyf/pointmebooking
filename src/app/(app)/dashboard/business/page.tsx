'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Booking, PopularService } from '@/types/booking';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalBookings: number;
  activeServices: number;
  totalRevenue: number;
  totalCustomers: number;
  recentBookings: Booking[];
  upcomingBookings: Booking[];
  popularServices: PopularService[];
}

export default function BusinessDashboardPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const supabase = createClientComponentClient();

  const fetchDashboardData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('business_id', profile.id)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch popular services
      const { data: servicesData, error: servicesError } = await supabase
        .from('popular_services')
        .select('*, service:services(*)')
        .eq('business_id', profile.id)
        .limit(5);

      if (servicesError) throw servicesError;
      setPopularServices(servicesData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Bookings', stat: stats?.totalBookings || 0, icon: CalendarIcon },
    { name: 'Active Services', stat: stats?.activeServices || 0, icon: ClockIcon },
    { name: 'Total Revenue', stat: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: CurrencyDollarIcon },
    { name: 'Total Customers', stat: stats?.totalCustomers || 0, icon: UserGroupIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.business_name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mt-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => {
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

      {/* Upcoming Bookings */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Bookings</h2>
          <Link
            href="/dashboard/business/bookings"
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 bg-white shadow rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {stats?.upcomingBookings.map((booking) => (
              <li key={booking.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.service!.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.customer!.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.scheduled_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.scheduled_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {stats?.upcomingBookings.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No upcoming bookings
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Popular Services */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Popular Services</h2>
          <Link
            href="/dashboard/business/services"
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            Manage services
          </Link>
        </div>
        <div className="mt-4 bg-white shadow rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {popularServices.map((service) => (
              <li key={service.service_id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {service.service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.count} bookings
                      </p>
                    </div>
                  </div>
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                </div>
              </li>
            ))}
            {popularServices.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No service statistics available
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
