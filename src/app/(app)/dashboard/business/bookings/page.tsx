'use client';

import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { EmailService } from '@/lib/supabase/services/email.service';
import { Booking, BookingStatus } from '@/types/booking';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { createBrowserClient } from '@supabase/ssr';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function BusinessBookings() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            service:services(*),
            customer:profiles(*)
          `)
          .eq('business_id', user.id)
          .order('scheduled_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id, supabase]);

  const handleStatusChange = async (booking: Booking, newStatus: BookingStatus) => {
    setLoading(booking.id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);

      if (error) throw error;

      // Send email notification
      if (booking.customer?.email) {
        await EmailService.sendBookingStatusUpdate(
          booking.customer.email,
          {
            service: booking.service?.name || 'Service',
            business: user?.email || 'Business',
            date: format(new Date(booking.scheduled_at), 'MMMM d, yyyy'),
            time: format(new Date(booking.scheduled_at), 'h:mm a')
          },
          newStatus
        );
      }

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: newStatus } : b
        )
      );

      toast.success(`Booking ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    } finally {
      setLoading(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
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
          {filteredBookings.map((booking) => (
            <li key={booking.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary truncate">
                      {booking.service?.name}
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
                            'bg-blue-100 text-blue-800':
                              booking.status === 'completed',
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
                      {format(new Date(booking.scheduled_at), 'MMM d, yyyy')} at{' '}
                      {format(new Date(booking.scheduled_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {booking.customer?.full_name}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {booking.customer?.email}
                    </p>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                      <button
                        onClick={() => handleStatusChange(booking, 'confirmed')}
                        disabled={loading === booking.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(booking, 'cancelled')}
                        disabled={loading === booking.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Decline
                      </button>
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                      <button
                        onClick={() => handleStatusChange(booking, 'completed')}
                        disabled={loading === booking.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
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
              : `No ${filter} bookings found.`}
          </p>
        </div>
      )}
    </div>
  );
}
