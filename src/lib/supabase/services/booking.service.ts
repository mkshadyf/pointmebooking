import { Database } from '@generated.types';
import { BaseServiceUtils } from './BaseService';
import { supabaseClientService } from './core/supabase-client.service';

// Define types from database schema
type DbBooking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

// Define extended types with relationships
interface BookingWithRelations extends DbBooking {
  customer?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  business?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

/**
 * Service for managing bookings
 * Follows the singleton pattern for consistent instance usage
 */
export class BookingService extends BaseServiceUtils {
  private static instance: BookingService;

  private constructor() {
    super();
  }

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  async getAll(filters: Partial<DbBooking> = {}): Promise<DbBooking[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      let query = client.from('bookings').select('*');

      // Apply filters dynamically
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    });
  }

  async getById(id: string): Promise<DbBooking> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    });
  }

  async getByCustomer(customerId: string): Promise<DbBooking[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    });
  }

  async getByCustomerWithRelations(customerId: string): Promise<BookingWithRelations[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .select('*, service:services(*), business:businesses(*), customer:profiles!customer_id(*)')
        .eq('customer_id', customerId);

      if (error) throw error;
      return data || [];
    });
  }

  async getByBusiness(businessId: string): Promise<DbBooking[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .eq('business_id', businessId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    });
  }

  async getByBusinessWithRelations(businessId: string): Promise<BookingWithRelations[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .select('*, customer:profiles!customer_id(*), service:services(*), business:businesses(*)')
        .eq('business_id', businessId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    });
  }

  async create(booking: BookingInsert): Promise<DbBooking> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .insert([booking])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  async createWithRelations(booking: BookingInsert): Promise<BookingWithRelations> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .insert(booking)
        .select('*, customer:profiles!customer_id(*), service:services(*), business:businesses(*)')
        .single();

      if (error) throw error;
      return data;
    });
  }

  async update(id: string, updates: BookingUpdate): Promise<DbBooking> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  async updateWithRelations(id: string, updates: BookingUpdate): Promise<BookingWithRelations> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select('*, customer:profiles!customer_id(*), service:services(*), business:businesses(*)')
        .single();

      if (error) throw error;
      return data;
    });
  }

  async delete(id: string): Promise<boolean> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { error } = await client
        .from('bookings')
        .delete()
        .eq('id', id);

      return !error;
    });
  }

  async getUpcomingBookings(userId: string, role: 'customer' | 'business'): Promise<DbBooking[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const column = role === 'customer' ? 'customer_id' : 'business_id';
      
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .eq(column, userId)
        .in('status', ['pending', 'confirmed'])
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    });
  }

  async getUpcomingBookingsWithRelations(userId: string, role: 'customer' | 'business'): Promise<BookingWithRelations[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const column = role === 'customer' ? 'customer_id' : 'business_id';
      
      const { data, error } = await client
        .from('bookings')
        .select('*, customer:profiles!customer_id(*), service:services(*), business:businesses(*)')
        .eq(column, userId)
        .in('status', ['pending', 'confirmed'])
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    });
  }

  async checkAvailability(businessId: string, startTime: string, endTime: string): Promise<boolean> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('bookings')
        .select('id')
        .eq('business_id', businessId)
        .in('status', ['pending', 'confirmed'])
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

      if (error) throw error;
      return data.length === 0; // If no bookings found, the time slot is available
    });
  }
}

export const bookingService = BookingService.getInstance();

// Static wrapper for backward compatibility
export class BookingServiceStatic {
  static async getAll(filters: Partial<DbBooking> = {}): Promise<DbBooking[]> {
    return bookingService.getAll(filters);
  }
  
  static async getById(id: string): Promise<DbBooking> {
    return bookingService.getById(id);
  }
  
  static async getByCustomer(customerId: string): Promise<BookingWithRelations[]> {
    return bookingService.getByCustomerWithRelations(customerId);
  }
  
  static async getByBusiness(businessId: string): Promise<BookingWithRelations[]> {
    return bookingService.getByBusinessWithRelations(businessId);
  }
  
  static async create(booking: BookingInsert): Promise<BookingWithRelations> {
    return bookingService.createWithRelations(booking);
  }
  
  static async update(id: string, updates: BookingUpdate): Promise<BookingWithRelations> {
    return bookingService.updateWithRelations(id, updates);
  }
  
  static async delete(id: string): Promise<boolean> {
    return bookingService.delete(id);
  }
  
  static async getUpcoming(userId: string, role: 'customer' | 'business'): Promise<BookingWithRelations[]> {
    return bookingService.getUpcomingBookingsWithRelations(userId, role);
  }
  
  static async checkAvailability(businessId: string, startTime: string, endTime: string): Promise<boolean> {
    return bookingService.checkAvailability(businessId, startTime, endTime);
  }
} 