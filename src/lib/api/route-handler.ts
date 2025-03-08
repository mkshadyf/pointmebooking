import { apiErrorHandler, createAuthError, createAuthorizationError } from '@/lib/error/error-handler';
import { logError } from '@/lib/error/error-logger';
import { CookieContainer, supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { Database } from '@/types/database/generated.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Define the typed Supabase client
type TypedSupabaseClient = SupabaseClient<Database>;

interface RouteConfig {
  requireAuth?: boolean;
  roles?: string[];
}

// Simplified handler for routes that don't need the full supabase client
interface SimpleRouteConfig {
  handler: (req: NextRequest) => Promise<Response>;
}

// Define the handler type
type RouteHandlerFunction = (
  req: NextRequest,
  supabase: TypedSupabaseClient,
  params: Record<string, string>
) => Promise<Response>;

export const routeHandler = (config: SimpleRouteConfig) => {
  return config.handler;
};

export const createRouteHandler = (handler: RouteHandlerFunction, config: RouteConfig = {}) => {
  return async (req: NextRequest, { params }: { params: Record<string, string> }) => {
    try {
      // Get cookies from request and ensure it's the right type
      const cookieStore = cookies() as unknown as CookieContainer;

      // Create a Supabase client using the SupabaseClientService
      const supabase = await supabaseClientService.getServerClient(cookieStore);

      if (config.requireAuth) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          const authError = createAuthError('You must be logged in to access this resource', {
            originalError: sessionError || new Error('No session found')
          }, 'route_handler');
          
          await logError(authError, undefined, {
            route: req.nextUrl.pathname,
            method: req.method
          });
          
          return NextResponse.json(
            { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
            { status: 401 }
          );
        }

        if (config.roles?.length) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (!profile || !config.roles.includes(profile.role)) {
            const authzError = createAuthorizationError('You do not have permission to access this resource', {
              requiredRoles: config.roles,
              userRole: profile?.role || 'unknown'
            }, 'route_handler');
            
            await logError(authzError, session.user.id, {
              route: req.nextUrl.pathname,
              method: req.method
            });
            
            return NextResponse.json(
              { error: 'Forbidden', message: 'You do not have permission to access this resource' },
              { status: 403 }
            );
          }
        }
      }

      // Call the handler with the request, supabase client, and params
      return handler(req, supabase, params);
    } catch (error) {
      await logError(error, undefined, {
        route: req.nextUrl.pathname,
        method: req.method,
        params: JSON.stringify(params)
      });
      
      const { body, status } = apiErrorHandler(error);
      return NextResponse.json(body, { status });
    }
  };
}; 