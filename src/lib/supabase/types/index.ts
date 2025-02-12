// Re-export database types
export * from './database';

// Re-export base types
export * from '@/types';

// Supabase-specific types
export type SupabaseAuthError = {
  message: string;
  status: number;
};

// Import database type for type helpers
import { Database } from './database';

// Table and enum type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Database-specific types
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbService = Database['public']['Tables']['services']['Row'];
export type DbBooking = Database['public']['Tables']['bookings']['Row'];

// Insert types
export type ProfileInsert = Omit<DbProfile, 'id' | 'created_at' | 'updated_at'>;
export type ServiceInsert = Omit<DbService, 'id' | 'created_at' | 'updated_at'>;
export type BookingInsert = Omit<DbBooking, 'id' | 'created_at' | 'updated_at'>;

// Update types
export type ProfileUpdate = Partial<ProfileInsert>;
export type ServiceUpdate = Partial<ServiceInsert>;
export type BookingUpdate = Partial<BookingInsert>;

// API types
export type ApiResponse<T = any> = {
  data: T | null;
  error: Error | null;
  status: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}; 