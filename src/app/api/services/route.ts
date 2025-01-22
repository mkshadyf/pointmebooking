import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get all services with business details
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        business:profiles!business_id (
          business_name,
          business_category,
          location,
          contact_number,
          working_hours
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
