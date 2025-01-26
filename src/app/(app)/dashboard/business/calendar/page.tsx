'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Booking } from '@/types/booking';
import { toast } from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { BookingForm } from '@/components/bookings/BookingForm';

export default function BusinessCalendar() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const supabase = createClientComponentClient();

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

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .in('service_id', serviceIds);

        if (error) throw error;
        setBookings(bookings || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id, supabase]);

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking;
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setSelectedBooking(null);
    setShowModal(true);
  };

  const handleBookingSubmit = async (bookingData: Partial<Booking>) => {
    if (!user?.id) return;

    try {
      if (selectedBooking) {
        // Update existing booking
        const { error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', selectedBooking.id);

        if (error) throw error;
        toast.success('Booking updated successfully');

        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === selectedBooking.id
              ? { ...booking, ...bookingData }
              : booking
          )
        );
      } else {
        // Create new booking
        const { data: newBooking, error } = await supabase
          .from('bookings')
          .insert([{ ...bookingData, business_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        toast.success('Booking created successfully');

        if (newBooking) {
          setBookings(prev => [...prev, newBooking]);
        }
      }

      setShowModal(false);
      setSelectedBooking(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving booking:', error);
      toast.error('Failed to save booking');
    }
  };

  const events = bookings.map(booking => ({
    id: booking.id,
    title: `Booking: ${booking.customer_name}`,
    start: booking.start_time,
    end: booking.end_time,
    backgroundColor: getStatusColor(booking.status),
    borderColor: getStatusColor(booking.status),
    extendedProps: {
      booking
    }
  }));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="overflow-hidden rounded-lg shadow">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Business Calendar</h1>
            <Button onClick={() => setShowModal(true)}>
              Add Booking
            </Button>
          </div>
          
          <div className="min-h-[600px]">
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
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBooking(null);
          setSelectedDate(null);
        }}
        title={selectedBooking ? 'Edit Booking' : 'New Booking'}
      >
        <BookingForm
          selectedDate={selectedDate || undefined}
          booking={selectedBooking || undefined}
          onSubmitAction={handleBookingSubmit}
          onCancelAction={() => {
            setShowModal(false);
            setSelectedBooking(null);
            setSelectedDate(null);
          }}
        />
      </Modal>
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
