import { Database } from '@generated.types';
import { UIService } from '..';

// Base types from generated schema
export type DbErrorLog = Database['public']['Tables']['error_logs']['Row'];
export type DbSchedule = Database['public']['Tables']['schedules']['Row'];
export type DbStaff = Database['public']['Tables']['staff']['Row'];
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type DbBusiness = Database['public']['Tables']['businesses']['Row'];
export type DbBusinessCategory = Database['public']['Tables']['business_categories']['Row'];
export type DbService = Database['public']['Tables']['services']['Row'];
export type DbServiceCategory = Database['public']['Tables']['service_categories']['Row'];

// ServiceFromDB for database-to-UI transformation
export interface ServiceFromDB extends Omit<DbService, 'admin_notes' | 'approval_status' | 'approved_at' | 'approved_by_id'> {
  max_capacity: number | null;
  location: string | null;
  created_by_id: string | null;
  approved_by_id: string | null;
  approved_at: string | null;
  featured: boolean;
  featured_order: number | null;
  approval_status: string;
  admin_notes: string | null;
  business?: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
}

// Enhanced types with relationships
export interface ErrorLog extends DbErrorLog {
    user?: {
        email: string;
        full_name: string | null;
    };
}

export interface Schedule extends DbSchedule {
    staff: {
        id: string;
        role: string;
        user: {
            full_name: string | null;
            email: string;
        };
    };
    business: {
        id: string;
        name: string;
    };
}

export interface Review {
    id: string;
    business_id: string;
    customer_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    customer?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface Payment {
    id: string;
    booking_id: string;
    amount: number;
    payment_status: string;
    transaction_id: string | null;
    created_at: string;
    booking?: {
        service: {
            name: string;
            price: number;
        };
        customer: {
            full_name: string | null;
            email: string;
        };
    };
}

export interface Staff extends DbStaff {
    user: {
        email: string;
        full_name: string | null;
        avatar_url: string | null;
    };
    business: {
        name: string;
        business_type: string | null;
    };
    schedules?: Schedule[];
}

export interface Business extends DbBusiness {
    owner?: {
        email: string;
        full_name: string | null;
    };
    category?: {
        name: string;
        icon: string | null;
    };
    services?: UIService[];
}

// Deprecated - use UIService from @/types instead for consistency
// This is kept for backward compatibility
export type Service = UIService;

export interface Booking extends DbBooking {
    customer?: {
        email: string;
        full_name: string | null;
    };
    service?: {
        name: string;
        price: number;
        duration: number;
    };
    business?: {
        name: string;
    };
} 