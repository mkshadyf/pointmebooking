'use client';

import { AuthProfile } from '@/types/database/auth';
import { DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { createBrowserClient } from '@supabase/ssr';
import { useCallback, useEffect, useState } from 'react';

interface CalendarProps {
    user: AuthProfile;
    onDateSelectAction: (date: Date) => Promise<void>;
    onBookingSelectAction: (bookingId: string) => Promise<void>;
}

export const Calendar = ({ user, onDateSelectAction, onBookingSelectAction }: CalendarProps) => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleDateSelect = useCallback(async (selectInfo: DateSelectArg) => {
        await onDateSelectAction(selectInfo.start);
    }, [onDateSelectAction]);

    const handleBookingSelect = useCallback(async (bookingId: string) => {
        await onBookingSelectAction(bookingId);
    }, [onBookingSelectAction]);

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const { data: bookingsData, error } = await supabase
                    .from('bookings')
                    .select(`
                        *,
                        customer:profiles!customer_id(*)
                    `)
                    .eq('business_id', user.id);

                if (error) throw error;

                setBookings(bookingsData || []);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id) {
            fetchBookings();
        }
    }, [user?.id, supabase]);

    const events = bookings.map((booking) => ({
        id: booking.id,
        title: `${booking.customer?.full_name || 'Unknown'} - ${booking.service_name}`,
        start: booking.start_time,
        end: booking.end_time,
        backgroundColor: getStatusColor(booking.status),
        extendedProps: { booking }
    }));

    const handleEventClick = (info: any) => {
        const booking = info.event.extendedProps.booking;
        handleBookingSelect(booking.id);
    };

    if (isLoading) {
        return <div>Loading calendar...</div>;
    }

    return (
        <div className="h-full">
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
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="100%"
            />
        </div>
    );
};

function getStatusColor(status: string): string {
    switch (status) {
        case 'confirmed':
            return '#4CAF50';
        case 'pending':
            return '#FFC107';
        case 'cancelled':
            return '#F44336';
        default:
            return '#2196F3';
    }
}
