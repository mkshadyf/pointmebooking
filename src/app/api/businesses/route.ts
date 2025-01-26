 
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });

    // Get all businesses with their services
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*, services(*)');

    if (error) {
      console.error('Error fetching businesses:', error);
      return NextResponse.json(
        { error: 'Error fetching businesses' },
        { status: 500 }
      );
    }

    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Error fetching businesses' },
      { status: 500 }
    );
  }
}
