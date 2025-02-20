import { Database } from '../types/database.types';
import { AuthSlice } from './slices/auth.slice';

export interface SupabaseStore extends AuthSlice {
    // Add other slices here as needed
}

export type { Database };
