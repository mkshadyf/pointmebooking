import { handleAuthError, handleClientError, handleDatabaseError } from '@/lib/errors/handlers';
import { UserProfile } from '@/types';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw handleAuthError(error);

    if (!user) {
      return { user: null, profile: null };
    }

    // Check cache first
    const cachedData = profileCache.get(user.id);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      return {
        user,
        profile: cachedData.profile,
      };
    }

    // If not in cache or expired, fetch from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw handleDatabaseError(profileError);

    // Update cache
    if (profile) {
      profileCache.set(user.id, {
        profile,
        timestamp: now,
      });
    }

    return {
      user,
      profile,
    };
  } catch (error) {
    await handleClientError(error);
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
    if (refreshError) throw handleAuthError(refreshError);

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

    if (profileError) throw handleDatabaseError(profileError);

    // Update cache with fresh data
    if (profile) {
      profileCache.set(user.id, {
        profile,
        timestamp: Date.now(),
      });
    }

    return { user, profile };
  } catch (error) {
    await handleClientError(error);
    return { user: null, profile: null };
  }
}

export function clearSessionCache(userId: string) {
  profileCache.delete(userId);
}
