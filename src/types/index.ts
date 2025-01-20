export type UserRole = 'business' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'business' | 'customer';
  // Business specific fields
  business_name?: string;
  description?: string;
  location?: string;
  contact_number?: string;
  working_hours?: {
    start: string;
    end: string;
  };
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

export interface BusinessProfile extends UserProfile {
  business_name: string;
  business_category: string;
  description: string;
  location: string;
  contact_number: string;
  working_hours: {
    start: string;
    end: string;
  };
  services: Service[];
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  customer_id: string;
  business_id: string;
  date: string;
  start_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface BusinessCategory extends Category {
  businesses: BusinessProfile[];
}

export interface ServiceCategory extends Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: Service[];
}
