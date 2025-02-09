import type { Database as SupabaseDatabase } from '@/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { getBrowserSupabaseClient } from './client';

export function useSupabase() {
  const [client] = useState(() => getBrowserSupabaseClient());
  return client;
}

// Use the Database type from '@/types/database.types' to ensure a 'public' schema exists
export function useSupabaseClient<Database extends SupabaseDatabase = SupabaseDatabase>(): SupabaseClient<Database, "public"> {
  const [client] = useState(() => getBrowserSupabaseClient() as SupabaseClient<Database, "public">);
  return client;
} 