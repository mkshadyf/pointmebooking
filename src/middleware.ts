import type { Database } from '@/types/database/generated.types';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for handling authentication and redirects
 * - Protects routes that require authentication
 * - Redirects authenticated users from auth pages
 * - Handles business onboarding flow redirects
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create the Supabase middleware client
  // Note: Using 'as any' here due to type incompatibilities between Next.js and Supabase
  // This is a known issue with the Supabase auth helpers and Next.js types
  const supabase = createMiddlewareClient<Database>({ 
    req: req as any, 
    res: res as any 
  });
  
  // Get the current route path
  const path = req.nextUrl.pathname;
  
  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Define route groups
  const isAuthRoute = 
    path.startsWith('/login') || 
    path.startsWith('/register') || 
    path.startsWith('/auth/reset-password');
    
  const isProtectedRoute = 
    path.startsWith('/dashboard') || 
    path.startsWith('/settings') || 
    path.startsWith('/onboarding/business');
    
  const isBusinessRoute = 
    path.startsWith('/dashboard/business');
    
  const isAdminRoute = 
    path.startsWith('/dashboard/admin');
    
  // If the user is not authenticated and tries to access a protected route
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If the user is authenticated and tries to access an auth route
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // If the user is authenticated, get the user profile
  if (session) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('user_id', session.user.id)
      .single();
    
    // Only proceed with profile checks if there's no error and profile exists
    if (!error && profile) {
      // If it's a business route, but the user is not a business
      if (isBusinessRoute && profile.role !== 'business') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      
      // If it's an admin route, but the user is not an admin
      if (isAdminRoute && profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      
      // If the user is a business but hasn't completed onboarding
      // and tries to access a business route (except onboarding)
      if (
        profile.role === 'business' && 
        !profile.onboarding_completed &&
        isBusinessRoute &&
        !path.startsWith('/onboarding/business')
      ) {
        return NextResponse.redirect(new URL('/onboarding/business', req.url));
      }
    }
  }
  
  return res;
}

/**
 * Matcher for the middleware
 * This defines which routes the middleware should run on
 */
export const config = {
  matcher: [
    // Auth routes
    '/login/:path*',
    '/register/:path*',
    '/auth/:path*',
    
    // Protected routes
    '/dashboard/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    
    // Skip static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
