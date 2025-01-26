'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { format } from 'date-fns';
import { Calendar } from '@/components/calendar/Calendar';
import { BookingForm } from '@/components/bookings/BookingForm';
import { withAuth } from '@/components/auth/withAuth';
import { Booking, Service } from '@/types';
import { useAppStore } from '@/lib/store';

function BusinessCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedBooking, setSelectedBooking] = useState<Booking>();
  const { services } = useAppStore();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedBooking(undefined);
  };

  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedDate(new Date(booking.start_time));
  };

  const handleBookingSubmit = async (bookingData: Partial<Booking>) => {
    try {
      if (selectedBooking) {
        // Update existing booking
        const { error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', selectedBooking.id);

        if (error) throw error;
      } else {
        // Create new booking
        const { error } = await supabase
          .from('bookings')
          .insert([bookingData]);

        if (error) throw error;
      }

      // Reset selection
      setSelectedDate(undefined);
      setSelectedBooking(undefined);
    } catch (error) {
      console.error('Error handling booking:', error);
    }
  };

  const handleCancel = () => {
    setSelectedDate(undefined);
    setSelectedBooking(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Business Calendar</h1>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onBookingSelect={handleBookingSelect}
        />
        <BookingForm
          selectedDate={selectedDate}
          booking={selectedBooking}
          onSubmitAction={handleBookingSubmit}
          onCancelAction={handleCancel}
        />
      </div>
    </div>
  );
}

export default withAuth(BusinessCalendarPage, ['business']);
