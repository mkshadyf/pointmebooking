import { Database } from "@/types/database/generated.types";

// Base Types
export type DbBusinessCategory = Database['public']['Tables']['business_categories']['Row'];
export type DbServiceCategory = Database['public']['Tables']['service_categories']['Row'];

// Insert Types
export type BusinessCategoryInsert = Database['public']['Tables']['business_categories']['Insert'];
export type ServiceCategoryInsert = Database['public']['Tables']['service_categories']['Insert'];

// Update Types
export type BusinessCategoryUpdate = Database['public']['Tables']['business_categories']['Update'];
export type ServiceCategoryUpdate = Database['public']['Tables']['service_categories']['Update'];

// Enhanced Types with Relationships
export interface ServiceCategoryWithBusiness extends DbServiceCategory {
    business_category: DbBusinessCategory;
}

export interface BusinessCategoryWithServices extends DbBusinessCategory {
    service_categories: DbServiceCategory[];
}

// Enums
export enum CategoryStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted'
} 