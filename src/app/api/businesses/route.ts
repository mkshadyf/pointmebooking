import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get all businesses with their services
    const { data: businesses, error } = await supabase
      .from('profiles')
      .select(`
        *,
        services (
          id,
          name,
          description,
          price,
          duration,
          category_id,
          image_url,
          is_available
        )
      `)
      .eq('role', 'business')
      .eq('onboarding_completed', true)
      .order('business_name');

    if (error) throw error;

    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}
