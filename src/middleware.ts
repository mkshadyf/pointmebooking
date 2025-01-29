import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Route configurations
const PROTECTED_ROUTES = ['/dashboard', '/onboarding']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']
const PUBLIC_ROUTES = ['/', '/services', '/businesses']

const pathStartsWith = (path: string, prefixes: string[]): boolean =>
  prefixes.some(prefix => path.startsWith(prefix))

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const path = request.nextUrl.pathname
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Handle user errors
    if (userError) {
      console.error('User error:', userError)
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')

      if (pathStartsWith(path, PROTECTED_ROUTES)) {
        return redirectToLogin(request, path)
      }
      return response
    }

    // Get session separately for expiration check
    const { data: { session } } = await supabase.auth.getSession()

    // Protected routes handling
    if (pathStartsWith(path, PROTECTED_ROUTES)) {
      if (!user) {
        return redirectToLogin(request, path)
      }

      // Validate session expiration using actual session data
      if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
        console.log('Session expired, redirecting to login')
        return redirectToLogin(request, path)
      }
    }

    // Prevent authenticated users from accessing auth routes
    if (pathStartsWith(path, AUTH_ROUTES) && user) {
      console.log('Authenticated user accessing auth route, redirecting')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add authenticated user headers using validated user data
    if (user) {
      const headers = new Headers(request.headers)
      headers.set('x-user-id', user.id)
      headers.set('x-user-role', user.user_metadata?.role || 'customer')
      response = NextResponse.next({ request: { headers } })
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    if (!request.nextUrl.pathname.startsWith('/error')) {
      return NextResponse.redirect(new URL('/error', request.url))
    }
    
    return response
  }
}

// Helper function for login redirects
function redirectToLogin(request: NextRequest, path: string) {
  const redirectUrl = new URL('/login', request.url)
  redirectUrl.searchParams.set('redirectTo', path)
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
}