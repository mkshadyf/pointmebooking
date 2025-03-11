import { logError } from '@/lib/error/error-logger';
import { authService } from '@/lib/supabase/services/auth/auth.service';
import { CookieContainer, supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { ROUTES } from '@/routes';
import { UserRole } from '@/types';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback handler
 * Handles the callback from OAuth providers and redirects users to the appropriate page
 * based on their role and onboarding status
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // If code is not present, redirect to login
  if (!code) {
    logError(new Error('No code provided in OAuth callback'), undefined, { 
      action: 'oauthCallback',
      url: request.url
    });
    return NextResponse.redirect(new URL(ROUTES.login.path, requestUrl.origin));
  }
  
  try {
    // Get cookies from request and ensure it's the right type
    const cookieStore = cookies() as unknown as CookieContainer;
    
    // Create a Supabase client using the SupabaseClientService
    const supabase = await supabaseClientService.getServerClient(cookieStore);
    
    // Exchange code for session
    // Note: We still need to use the Supabase client directly for this operation
    // as the auth service doesn't have a method for exchanging code for session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get user session
    const { data: sessionData, error: sessionError } = await authService.getSession();
    
    if (sessionError || !sessionData?.user) {
      logError(sessionError || new Error('No user found after exchanging code for session'), undefined, {
        action: 'oauthCallback',
        step: 'getSession'
      });
      return NextResponse.redirect(new URL(ROUTES.login.path, requestUrl.origin));
    }
    
    // Get user profile to check role and onboarding status
    const { data: profileData, error: profileError } = await authService.getProfile();
    
    if (profileError || !profileData) {
      logError(profileError || new Error('Error fetching user profile'), undefined, {
        action: 'oauthCallback',
        step: 'getProfile',
        userId: sessionData.user.id
      });
      return NextResponse.redirect(new URL(ROUTES.dashboard.path, requestUrl.origin));
    }
    
    // If business user and onboarding not completed, redirect to onboarding
    if (profileData.role === 'business' && !profileData.onboarding_completed) {
      console.log('Redirecting business user to onboarding');
      return NextResponse.redirect(new URL(ROUTES.businessOnboarding.path, requestUrl.origin));
    }
    
    // For other roles or if onboarding is completed, redirect to the appropriate dashboard
    const role = profileData.role as UserRole || 'customer';
    const isOnboarded = profileData.onboarding_completed === true;
    
    // Determine the redirect path based on role and onboarding status
    const redirectPath = isOnboarded 
      ? (role === 'business' 
          ? ROUTES.businessDashboard.path 
          : role === 'admin' 
            ? ROUTES.adminDashboard.path 
            : ROUTES.customerDashboard.path)
      : (role === 'business' 
          ? ROUTES.businessOnboarding.path 
          : ROUTES.customerOnboarding.path);
    
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  } catch (error) {
    logError(error, undefined, {
      action: 'oauthCallback',
      step: 'overall',
      url: request.url
    });
    // Redirect to login on error with a query parameter to indicate the error
    return NextResponse.redirect(
      new URL(`${ROUTES.login.path}?error=auth_callback_error`, requestUrl.origin)
    );
  }
}
