import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';

  if (code) {
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

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .single();

      // Determine redirect path based on user role and onboarding status
      if (profile) {
        if (profile.role === 'business' && !profile.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding/business', requestUrl.origin));
        }
        return NextResponse.redirect(new URL(
          profile.role === 'business' ? '/dashboard/business' : '/dashboard/customer',
          requestUrl.origin
        ));
      }
    }
  }

  // Default redirect to home page if something went wrong
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
