import { SUPABASE_CONFIG } from '@/config/supabase';
import { Database } from '@generated.types';
import { createClient } from '@supabase/supabase-js';

export const createServerClient = () => {
    return createClient<Database>(
        SUPABASE_CONFIG.URL!,
        SUPABASE_CONFIG.ANON_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );
}; 