 export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  business_id: string;
  customer_id: string;
  service_id: string;
  customer_name: string;
  start_time: string;
  end_time: string;
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
    email: string;
    full_name: string;
    phone?: string;
  };
}

export interface PopularService {
  service_id: string;
  service: {
    id: string;
    name: string;
  };
  id: string;
  name: string;
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
