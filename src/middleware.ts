import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define protected and public routes
const PROTECTED_ROUTES = ['/dashboard', '/onboarding'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];
const PUBLIC_ROUTES = ['/', '/services', '/businesses'];

// Helper to check if path starts with any of the given prefixes
const pathStartsWith = (path: string, prefixes: string[]): boolean => 
  prefixes.some(prefix => path.startsWith(prefix));

export async function middleware(request: NextRequest) {
  // Initialize response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Initialize Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Get current path
    const path = request.nextUrl.pathname;

    // Check auth status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Handle session error
    if (sessionError) {
      console.error('Session error in middleware:', sessionError);
      // Clear any invalid session cookies
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      
      // Only redirect to login if trying to access protected route
      if (pathStartsWith(path, PROTECTED_ROUTES)) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', path);
        return NextResponse.redirect(redirectUrl);
      }
      return response;
    }

    // Handle protected routes
    if (pathStartsWith(path, PROTECTED_ROUTES)) {
      if (!session) {
        console.log('Unauthorized access attempt to protected route:', path);
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', path);
        return NextResponse.redirect(redirectUrl);
      }

      // Check session expiration
      const expiresAt = session.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now()) {
        console.log('Session expired, redirecting to login');
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', path);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Handle auth routes (prevent authenticated users from accessing)
    if (pathStartsWith(path, AUTH_ROUTES) && session) {
      console.log('Authenticated user attempting to access auth route, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add user info to request headers for server components
    if (session?.user) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.user.id);
      requestHeaders.set('x-user-role', session.user.user_metadata.role || 'customer');

      // Create a new response with the modified headers
      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Handle critical errors by redirecting to error page
    // Only redirect if not already on error page to prevent loops
    if (!request.nextUrl.pathname.startsWith('/error')) {
      return NextResponse.redirect(new URL('/error', request.url));
    }
    
    return response;
  }
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
