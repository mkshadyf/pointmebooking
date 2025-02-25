import { Database } from '@generated.types';

// Base types from generated schema
export type DbErrorLog = Database['public']['Tables']['error_logs']['Row'];
export type DbSchedule = Database['public']['Tables']['schedules']['Row'];
export type DbStaff = Database['public']['Tables']['staff']['Row'];
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type DbBusiness = Database['public']['Tables']['businesses']['Row'];
export type DbBusinessCategory = Database['public']['Tables']['business_categories']['Row'];
export type DbService = Database['public']['Tables']['services']['Row'];
export type DbServiceCategory = Database['public']['Tables']['service_categories']['Row'];

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
    services?: Service[];
}

export interface Service extends DbService {
    business?: {
        id: string;
        name: string;
        description?: string | null;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        phone?: string | null;
        email?: string | null;
        logo_url?: string | null;
    };
    category?: {
        id: string;
        name: string;
        icon?: string | null;
    };
}

export interface Booking extends DbBooking {
    user?: {
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