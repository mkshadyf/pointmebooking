import type { Database } from './index';

export type { Database };

// Re-export the Database type for use in other files
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Re-export all the types we need
export type {
    AuthProfile,
    Booking,
    BusinessCategory,
    BusinessCategoryInsert,
    BusinessCategoryUpdate,
    DbBusinessCategory,
    DbServiceCategory,
    ServiceCategory,
    ServiceCategoryInsert,
    ServiceCategoryUpdate
} from './index';
