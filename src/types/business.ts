import { Database } from './database/generated.types';

/**
 * Business Category from database
 */
export type BusinessCategory = Database['public']['Tables']['business_categories']['Row'];

/**
 * Service Category from database
 */
export type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];

/**
 * Business Profile from database
 */
export type Business = Database['public']['Tables']['businesses']['Row'];

/**
 * Business with related data
 */
export interface BusinessWithRelations extends Business {
  category?: BusinessCategory;
  services?: Service[];
  owner?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

/**
 * Service from database
 */
export type Service = Database['public']['Tables']['services']['Row'];

/**
 * Service with related data
 */
export interface ServiceWithRelations extends Service {
  business?: {
    id: string;
    name: string;
  };
  category?: ServiceCategory;
}

/**
 * Business onboarding data interface
 */
export interface BusinessOnboardingData {
  businessName?: string;
  businessType?: string;
  description?: string;
  businessCategoryId?: string;
  businessCategoryName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  galleryImages?: string[];
  services?: Array<{
    id?: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    categoryId?: string;
  }>;
}

/**
 * Business dashboard metrics
 */
export interface BusinessMetrics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalCustomers: number;
  totalServices: number;
}

/**
 * Business onboarding step
 */
export enum BusinessOnboardingStep {
  BASIC_INFO = 'basic-info',
  CONTACT = 'contact',
  LOCATION = 'location',
  MEDIA = 'media',
  SERVICES = 'services',
  REVIEW = 'review'
}

/**
 * Business creation response
 */
export interface BusinessCreationResponse {
  success: boolean;
  business?: Business;
  error?: string;
} 