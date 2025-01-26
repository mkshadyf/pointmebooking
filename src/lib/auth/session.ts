import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';

export async function getSession(): Promise<{ user: User | null; profile: UserProfile | null }> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (!session?.user) {
      return { user: null, profile: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      user: session.user,
      profile,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return { user: null, profile: null };
  }
}

export async function refreshSession(): Promise<{ user: User | null; profile: UserProfile | null }> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: { user }, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw refreshError;

    if (!user) {
      return { user: null, profile: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    return { user, profile };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { user: null, profile: null };
  }
}
