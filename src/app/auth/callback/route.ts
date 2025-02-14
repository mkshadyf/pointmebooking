import { ROUTES } from '@/config/routes';
import { EmailService } from '@/lib/supabase/services';
import { ErrorCode, handleApiError } from '@/lib/supabase/utils/errors';
 
import { UserRole } from '@/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const MAX_VERIFICATION_ATTEMPTS = 5;
const VERIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

function redirectWithError(requestUrl: URL, code: ErrorCode): Response {
  const redirectUrl = new URL(ROUTES.error.path, requestUrl.origin);
  const error = handleApiError(new Error(code));
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
      
      // Check if email is already verified through OAuth
      const isOAuthVerified = user.app_metadata?.provider && user.app_metadata.provider !== 'email';
      const emailVerified = isOAuthVerified || !!user.email_confirmed_at;

      const { error: createError } = await supabase
          .from('profiles')
          .insert({
          id: user.id,
          email: user.email,
            role,
          email_verified: emailVerified,
          verification_attempts: 0,
          last_verification_attempt: null,
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

      // If email is not verified, send verification email
      if (!emailVerified) {
        try {
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          await EmailService.sendVerificationEmail(user.email, verificationCode);
        } catch (error) {
          handleApiError(error);
        }
        return NextResponse.redirect(new URL(ROUTES.verifyEmail.path, requestUrl.origin));
      }

      // Redirect to appropriate onboarding
      const onboardingPath = role === 'business' 
        ? ROUTES.businessOnboarding.path 
        : ROUTES.customerOnboarding.path;
      return NextResponse.redirect(new URL(onboardingPath, requestUrl.origin));
    }

    // Handle existing profile
    if (profile) {
      // Check verification status
      if (!profile.email_verified) {
        // Check rate limiting
        if (profile.verification_attempts >= MAX_VERIFICATION_ATTEMPTS) {
          const lastAttempt = new Date(profile.last_verification_attempt || 0);
          const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
          
          if (timeSinceLastAttempt < VERIFICATION_COOLDOWN) {
            return redirectWithError(requestUrl, ErrorCode.AUTH_EMAIL_NOT_VERIFIED);
          }
          
          // Reset attempts after cooldown
          await supabase
            .from('profiles')
            .update({
              verification_attempts: 0,
              last_verification_attempt: null
            })
            .eq('id', user.id);
        }

        return NextResponse.redirect(new URL(ROUTES.verifyEmail.path, requestUrl.origin));
      }

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
