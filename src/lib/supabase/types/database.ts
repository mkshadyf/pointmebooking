import { Database } from '@/types/database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type AuthProfile = Tables<'profiles'> & {
  role: 'customer' | 'business';
  email?: string;
};

export type Service = Tables<'services'>;
export type Category = Tables<'categories'>;
export type Profile = Tables<'profiles'>;
export type Booking = Tables<'bookings'>;

// Re-export common types
export * from '@/types/database.types';

