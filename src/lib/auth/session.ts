import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

interface CachedProfile {
  profile: UserProfile;
  timestamp: number;
}

const profileCache = new Map<string, CachedProfile>();

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

    // Check cache first
    const cachedData = profileCache.get(session.user.id);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      return {
        user: session.user,
        profile: cachedData.profile,
      };
    }

    // If not in cache or expired, fetch from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    // Update cache
    if (profile) {
      profileCache.set(session.user.id, {
        profile,
        timestamp: now,
      });
    }

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

    // Clear cache when refreshing session
    profileCache.delete(user.id);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Update cache with fresh data
    if (profile) {
      profileCache.set(user.id, {
        profile,
        timestamp: Date.now(),
      });
    }

    return { user, profile };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { user: null, profile: null };
  }
}

export function clearSessionCache(userId: string) {
  profileCache.delete(userId);
}
