import { SUPABASE_CONFIG } from '@/config/supabase';
import { Database } from '@generated.types';
import { createClient } from '@supabase/supabase-js';

// Browser client exports
export * from './browser';

// Server client exports
export const supabase = createClient<Database>(
    SUPABASE_CONFIG.URL!,
    SUPABASE_CONFIG.ANON_KEY!
);

// Type exports
export type { Database } from '@generated.types';
export type SupabaseClient = ReturnType<typeof createClient>; 