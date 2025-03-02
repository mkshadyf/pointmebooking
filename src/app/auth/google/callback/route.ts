import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      // Exchange the code for a session
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single();

      // Determine redirect URL based on profile
      let redirectUrl = '/dashboard/business';
      
      if (profile) {
        if (profile.role === 'business') {
          redirectUrl = profile.onboarding_completed 
            ? '/dashboard/business'
            : '/onboarding/business';
        } else {
          redirectUrl = '/dashboard/customer';
        }
      }

      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_callback_failed', requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin));
}
