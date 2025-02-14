'use client';

import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { Booking } from '@/types';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onBookingSelect: (booking: Booking) => void;
}

interface CustomerProfile {
  id: string;
  full_name: string;
}

export function Calendar({ onDateSelect, onBookingSelect }: CalendarProps) {
  const [bookings, setBookings] = useState<(Booking & { customer?: CustomerProfile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;

      try {
        const { data: services } = await supabase
          .from('services')
          .select('id')
          .eq('business_id', user.id);

        if (!services) return;

        const serviceIds = services.map(service => service.id);

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .in('service_id', serviceIds);

        if (bookingsError) throw bookingsError;

        // Fetch customer profiles for each booking
        const bookingsWithCustomers = await Promise.all(
          (bookingsData || []).map(async (booking) => {
            const { data: customerData } = await supabase
              .from('profiles')
              .select('id, full_name')
              .eq('id', booking.customer_id)
              .single();

            return {
              ...booking,
              customer: customerData
            };
          })
        );

        setBookings(bookingsWithCustomers);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id]);

  const events = bookings.map(booking => ({
    id: booking.id,
    title: `Booking: ${booking.customer?.full_name || 'Unknown Customer'}`,
    start: booking.start_time,
    end: booking.end_time,
    backgroundColor: getStatusColor(booking.status),
    borderColor: getStatusColor(booking.status),
    extendedProps: {
      booking
    }
  }));

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking;
    onBookingSelect(booking);
  };

  const handleDateSelect = (selectInfo: any) => {
    onDateSelect(selectInfo.start);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[600px] rounded-lg bg-white p-4 shadow-md">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        select={handleDateSelect}
        height="auto"
      />
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return '#10B981'; // green
    case 'pending':
      return '#F59E0B'; // yellow
    case 'cancelled':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
}
