'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Booking } from '@/types/booking';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isEqual, parseISO, getDay } from 'date-fns';
import clsx from 'clsx';
import Link from 'next/link';

export default function BusinessCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;

      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            service:services(*),
            customer:profiles(*)
          `)
          .eq('business_id', user.id)
          .gte('scheduled_at', start.toISOString())
          .lte('scheduled_at', end.toISOString());

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id, currentDate, supabase]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getBookingsForDay = (date: Date) => {
    return bookings.filter((booking) =>
      isEqual(parseISO(booking.scheduled_at).setHours(0, 0, 0, 0), date.setHours(0, 0, 0, 0))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Calendar
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Today
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center text-gray-900">
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
            }
            type="button"
            className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Previous month</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="flex-auto text-sm font-semibold text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
            }
            type="button"
            className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Next month</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
          <div className="text-center">S</div>
          <div className="text-center">M</div>
          <div className="text-center">T</div>
          <div className="text-center">W</div>
          <div className="text-center">T</div>
          <div className="text-center">F</div>
          <div className="text-center">S</div>
        </div>

        <div className="mt-2 grid grid-cols-7 text-sm">
          {days.map((day, dayIdx) => {
            const dayBookings = getBookingsForDay(day);
            return (
              <div
                key={day.toString()}
                className={clsx(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  'py-2'
                )}
              >
                <button
                  type="button"
                  className={clsx(
                    'mx-auto flex h-8 w-8 items-center justify-center rounded-full',
                    isToday(day) && 'text-white',
                    !isToday(day) && isSameMonth(day, currentDate) && 'text-gray-900',
                    !isToday(day) && !isSameMonth(day, currentDate) && 'text-gray-400',
                    isToday(day) && 'bg-primary',
                    'hover:bg-gray-200'
                  )}
                >
                  <time dateTime={format(day, 'yyyy-MM-dd')}>
                    {format(day, 'd')}
                  </time>
                </button>

                {dayBookings.length > 0 && (
                  <div className="w-full px-2">
                    {dayBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/dashboard/business/bookings#${booking.id}`}
                        className={clsx(
                          'block w-full text-xs leading-5 p-1 rounded-sm mt-1 truncate',
                          {
                            'bg-green-100 text-green-800': booking.status === 'confirmed',
                            'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                            'bg-blue-100 text-blue-800': booking.status === 'completed',
                            'bg-red-100 text-red-800': booking.status === 'cancelled',
                          }
                        )}
                      >
                        {format(parseISO(booking.scheduled_at), 'HH:mm')} -{' '}
                        {booking.service?.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];
