import { ROUTES } from '@/config/routes';
import { handleApiError, handleError } from '@/lib/errors/handlers';
import { ErrorCode } from '@/lib/errors/types';
import { UserRole } from '@/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function redirectWithError(requestUrl: URL, code: ErrorCode): Response {
  const redirectUrl = new URL(ROUTES.error.path, requestUrl.origin);
  const error = handleError(code);
  redirectUrl.searchParams.set('code', error.code);
  redirectUrl.searchParams.set('message', error.message);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || ROUTES.customerDashboard.path;

  if (!code) {
    return redirectWithError(requestUrl, ErrorCode.AUTH_INVALID_TOKEN);
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return redirectWithError(requestUrl, ErrorCode.AUTH_OAUTH_ERROR);
    }

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return redirectWithError(requestUrl, ErrorCode.AUTH_SESSION_EXPIRED);
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Create profile if it doesn't exist
    if (!profile && !profileError) {
      const role = (user.user_metadata.role as UserRole) || 'customer';
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role,
          email_verified: true,
          onboarding_completed: false,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        return redirectWithError(requestUrl, ErrorCode.PROFILE_CREATION_FAILED);
      }

      // Redirect to appropriate onboarding
      const onboardingPath = role === 'business' 
        ? ROUTES.businessOnboarding.path 
        : ROUTES.customerOnboarding.path;
      return NextResponse.redirect(new URL(onboardingPath, requestUrl.origin));
    }

    // Handle existing profile
    if (profile) {
      // Determine redirect path based on role and onboarding status
      if (!profile.onboarding_completed) {
        const onboardingPath = profile.role === 'business'
          ? ROUTES.businessOnboarding.path
          : ROUTES.customerOnboarding.path;
        return NextResponse.redirect(new URL(onboardingPath, requestUrl.origin));
      }

      const dashboardPath = profile.role === 'business'
        ? ROUTES.businessDashboard.path
        : ROUTES.customerDashboard.path;
      return NextResponse.redirect(new URL(dashboardPath, requestUrl.origin));
    }

    // If next path is specified and valid, use it
    if (next.startsWith('/')) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    // Default redirect
    return NextResponse.redirect(new URL(ROUTES.customerDashboard.path, requestUrl.origin));
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error);
    return handleApiError(error);
  }
}
