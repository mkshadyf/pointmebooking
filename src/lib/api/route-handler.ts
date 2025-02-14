import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../supabase';
import { handleApiError } from '../supabase/utils/errors';

type RouteHandler = (
  req: NextRequest,
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  params?: { [key: string]: string }
) => Promise<Response>;

interface RouteConfig {
  requireAuth?: boolean;
  roles?: string[];
}

export const createRouteHandler = (handler: RouteHandler, config: RouteConfig = {}) => {
  return async (req: NextRequest, { params }: { params?: { [key: string]: string } } = {}) => {
    try {
      const supabase = await createServerSupabaseClient();

      if (config.requireAuth) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          return NextResponse.json(
            { error: 'Unauthorized' },
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
            return NextResponse.json(
              { error: 'Forbidden' },
              { status: 403 }
            );
          }
        }
      }

      return handler(req, supabase, params);
    } catch (error) {
      const apiError = handleApiError(error);
      return NextResponse.json(
        { error: apiError.message },
        { status: apiError.code === 'auth/unauthorized' ? 401 : 500 }
      );
    }
  };
}; 