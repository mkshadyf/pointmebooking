'use client';

import { SUPABASE_CONFIG } from '@/config/supabase';
import { Database } from '@/types/database/generated.types';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient<Database>(
    SUPABASE_CONFIG.URL!,
    SUPABASE_CONFIG.ANON_KEY!
); 