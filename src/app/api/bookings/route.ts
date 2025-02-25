import { routeHandler } from '@/lib/api/route-handler';
import { bookingService } from '@/lib/supabase/services/booking.service';
import { NextRequest, NextResponse } from 'next/server';

export const GET = routeHandler({
  handler: async (req: NextRequest) => {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    let data;

    try {
      if (id) {
        data = await bookingService.getById(id);
      } else {
        data = await bookingService.getAll();
      }
      
      return NextResponse.json({ data });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }
  }
});

export const POST = routeHandler({
  handler: async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = await bookingService.create(body);
      
      return NextResponse.json({ data });
    } catch (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }
  }
});

export const PUT = routeHandler({
  handler: async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { id, ...updates } = body;
      
      if (!id) {
        return NextResponse.json(
          { error: 'Booking ID is required' },
          { status: 400 }
        );
      }
      
      const data = await bookingService.update(id, updates);
      
      return NextResponse.json({ data });
    } catch (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }
  }
});

export const DELETE = routeHandler({
  handler: async (req: NextRequest) => {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    try {
      const success = await bookingService.delete(id);
      
      if (success) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: 'Failed to delete booking' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      );
    }
  }
}); 