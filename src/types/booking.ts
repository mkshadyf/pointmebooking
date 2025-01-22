 
export interface Booking {
  id: string;
  business_id: string;
  customer_id: string;
  service_id: string;
  scheduled_at: string;
  status: BookingStatus;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  service?: {
    id: string;
    name: string;
    duration: number;
    price: number;
    description: string;
    category_id: string;
    is_available: boolean;
  };
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface PopularService {
  service_id: string;
  service: {
    id: string;
    name: string;
  };
  count: number;
  total_bookings: number;
}

export interface BookingStats {
  total_bookings: number;
  active_services: number;
  total_revenue: number;
  unique_customers: number;
}

export interface BookingFilters {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  serviceId?: string;
}
