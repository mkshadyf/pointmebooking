import { ROUTES } from '@/routes';
 
import { CookieContainer, supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback handler
 * Handles the callback from OAuth providers and redirects users to the appropriate page
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // If code is not present, redirect to login
  if (!code) {
    return NextResponse.redirect(new URL(ROUTES.login.path, requestUrl.origin));
  }
  
  try {
    // Get cookies from request and ensure it's the right type
    const cookieStore = cookies() as unknown as CookieContainer;
    
    // Create a Supabase client using the SupabaseClientService
    const supabase = await supabaseClientService.getServerClient(cookieStore);
    
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect to the dashboard
    return NextResponse.redirect(new URL(ROUTES.dashboard.path, requestUrl.origin));
  } catch (error) {
    console.error('Error exchanging code for session:', error);
    // Redirect to login on error
    return NextResponse.redirect(new URL(ROUTES.login.path, requestUrl.origin));
  }
}
