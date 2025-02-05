import { canAccessRoute, getRedirectPath, getRouteConfig, ROUTES } from '@/config/routes';
import { createError } from '@/lib/errors/handlers';
import { ErrorCode } from '@/lib/errors/types';
import { UserRole } from '@/types';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define protected and public routes

// Helper to check if path starts with any of the given prefixes

// Helper function for login redirects
function redirectToLogin(request: NextRequest, path: string) {
  const redirectUrl = new URL(ROUTES.login.path, request.url);
  redirectUrl.searchParams.set('redirectTo', path);
  return NextResponse.redirect(redirectUrl);
}

// Helper function for error redirects
function redirectToError(request: NextRequest, code: ErrorCode, redirectTo?: string) {
  const error = createError(code);
  const redirectUrl = new URL(ROUTES.error.path, request.url);
  redirectUrl.searchParams.set('code', error.code);
  redirectUrl.searchParams.set('message', error.message);
  if (redirectTo) {
    redirectUrl.searchParams.set('redirectTo', redirectTo);
  }
  return NextResponse.redirect(redirectUrl);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Create supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            response.cookies.delete({
              name,
              ...options,
            });
          },
        },
      }
    );

    // Get current path
    const path = request.nextUrl.pathname;
    const routeConfig = getRouteConfig(path);

    // If no route config found, allow access (for static files etc.)
    if (!routeConfig) {
      return response;
    }

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Handle auth routes (login, register, etc.)
    if (!routeConfig.requiresAuth) {
      if (user) {
        // If user is already logged in, redirect to appropriate dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const redirectTo = request.nextUrl.searchParams.get('redirectTo') || 
            getRedirectPath(profile.role as UserRole, true, profile.onboarding_completed);
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
      }
      return response;
    }

    // Handle protected routes
    if (!user || userError) {
      return redirectToLogin(request, path);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return redirectToError(request, ErrorCode.PROFILE_NOT_FOUND);
    }

    // Check role-based access
    if (!canAccessRoute(profile.role as UserRole, path)) {
      return redirectToError(request, ErrorCode.AUTH_UNAUTHORIZED);
    }

    // Check email verification if required
    if (routeConfig.requiresVerification && !profile.email_verified) {
      return NextResponse.redirect(new URL(ROUTES.verifyEmail.path, request.url));
    }

    // Check onboarding status if required
    if (routeConfig.requiresOnboarding && !profile.onboarding_completed && !path.includes('/onboarding')) {
      const onboardingPath = profile.role === 'business' 
        ? ROUTES.businessOnboarding.path 
        : ROUTES.customerOnboarding.path;
      return NextResponse.redirect(new URL(onboardingPath, request.url));
    }

    // Add user context to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', profile.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return redirectToError(request, ErrorCode.UNKNOWN_ERROR);
  }
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
