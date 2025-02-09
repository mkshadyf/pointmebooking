import { ROUTES } from '@/config/routes';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './lib/supabase/client';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/services',
  '/businesses',
  ROUTES.login.path,
  ROUTES.register.path,
  ROUTES.forgotPassword.path,
];

// Helper to check if path starts with any of the given prefixes

// Helper function for login redirects

// Helper function for error redirects

export async function middleware(request: NextRequest) {
  // Create supabase client
  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.delete({ name, ...options });
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;

  // Skip auth check for public assets
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path === '/manifest.json' ||
    path === '/favicon.ico' ||
    path.match(/\.(ico|png|jpg|jpeg|svg|css|js|webp|gif)$/)
  ) {
    return NextResponse.next();
  }

  // Check if the current path is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => path.startsWith(route));

  // Allow access to public routes
  if (isPublicRoute) {
    // If user is logged in and trying to access login/register pages, redirect to dashboard
    if (session && [ROUTES.login.path, ROUTES.register.path].some(route => path.startsWith(route))) {
      const redirectUrl = new URL(
        session.user?.user_metadata?.role === 'business' 
          ? ROUTES.businessDashboard.path 
          : ROUTES.customerDashboard.path,
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!session || error) {
    // Only add redirectTo for protected routes, not for direct login attempts
    const loginUrl = new URL(ROUTES.login.path, request.url);
    if (!path.startsWith(ROUTES.login.path)) {
      loginUrl.searchParams.set('redirectTo', path);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Onboarding check for business users
  if (
    session.user?.user_metadata?.role === 'business' && 
    !session.user?.user_metadata?.onboarding_completed &&
    !path.startsWith(ROUTES.businessOnboarding.path)
  ) {
    return NextResponse.redirect(new URL(ROUTES.businessOnboarding.path, request.url));
  }

  return NextResponse.next();
}

// Update the config matcher to explicitly exclude manifest.json and other static files
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - manifest.json
     * - favicon.ico
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|api|manifest.json|favicon.ico).*)',
  ],
};
