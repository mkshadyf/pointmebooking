import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });

    // Get all services with business details
    const { data: services, error } = await supabase
      .from('services')
      .select('*, business:businesses(*)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json(
        { error: 'Error fetching services' },
        { status: 500 }
      );
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Error fetching services' },
      { status: 500 }
    );
  }
}
