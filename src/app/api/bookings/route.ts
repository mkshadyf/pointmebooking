import { routeHandler } from '@/lib/api/route-handler';
import { apiErrorHandler } from '@/lib/error/error-handler';
import { logError } from '@/lib/error/error-logger';
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
      await logError(error, undefined, { 
        route: 'GET /api/bookings',
        requestParams: url.searchParams.toString()
      });
      const { body, status } = apiErrorHandler(error);
      return NextResponse.json(body, { status });
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
      await logError(error, undefined, { 
        route: 'POST /api/bookings',
        requestBody: await req.clone().text().catch(() => 'Could not read body')
      });
      const { body, status } = apiErrorHandler(error);
      return NextResponse.json(body, { status });
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
      await logError(error, undefined, { 
        route: 'PUT /api/bookings',
        requestBody: await req.clone().text().catch(() => 'Could not read body')
      });
      const { body, status } = apiErrorHandler(error);
      return NextResponse.json(body, { status });
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
        await logError(new Error('Failed to delete booking'), undefined, {
          route: 'DELETE /api/bookings',
          bookingId: id
        });
        return NextResponse.json(
          { error: 'Failed to delete booking' },
          { status: 500 }
        );
      }
    } catch (error) {
      await logError(error, undefined, { 
        route: 'DELETE /api/bookings',
        requestParams: url.searchParams.toString()
      });
      const { body, status } = apiErrorHandler(error);
      return NextResponse.json(body, { status });
    }
  }
}); 