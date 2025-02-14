'use client';

import { BookingForm } from '@/components/bookings/BookingForm';
import { Calendar } from '@/components/calendar/Calendar';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { withAuth } from '@/lib/supabase/auth/guards/withAuth';
 
import { Booking } from '@/types';
import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

export default withAuth(function BusinessCalendarPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { user } = useAuth();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedBooking(null);
  };

  const handleBookingUpdate = async (updatedBooking: Partial<Booking>) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update(updatedBooking)
        .eq('id', selectedBooking?.id);

      if (error) throw error;
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleBookingCreate = async (newBooking: Partial<Booking>) => {
    try {
      const bookingData = {
        ...newBooking,
        business_id: user?.id,
        status: 'pending',
        date: selectedDate?.toISOString().split('T')[0],
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;
      setSelectedBooking(data);
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };


  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-1">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onBookingSelect={handleBookingSelect}
          />
        </div>
        
        {(selectedBooking || selectedDate) && (
          <div className="col-span-1">
            <BookingForm
              selectedDate={selectedDate}
              booking={selectedBooking || undefined}
              onSubmitAction={selectedBooking ? handleBookingUpdate : handleBookingCreate}
              onCancelAction={() => {
                setSelectedBooking(null);
                setSelectedDate(undefined);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});
