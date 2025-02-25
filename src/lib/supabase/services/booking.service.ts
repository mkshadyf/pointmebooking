import { Database } from '@generated.types';
import { supabase } from '../client';
import { BaseService } from './BaseService';

// Define types from database schema
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
export type BookingStatus = Database['public']['Enums']['booking_status'];

export class BookingService extends BaseService<'bookings'> {
  constructor() {
    super(supabase, 'bookings');
  }

  async getAll(filters: Partial<DbBooking> = {}): Promise<DbBooking[]> {
    let query = this.client.from('bookings').select('*');

    // Apply filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<DbBooking> {
    try {
      const { data, error } = await this.client
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error(`Booking with id ${id} not found`);
      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByCustomer(customerId: string): Promise<DbBooking[]> {
    const { data, error } = await this.client
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId);

    if (error) throw error;
    return data || [];
  }

  async getByBusiness(businessId: string): Promise<DbBooking[]> {
    const { data, error } = await this.client
      .from('bookings')
      .select('*')
      .eq('business_id', businessId);

    if (error) throw error;
    return data || [];
  }

  async create(booking: BookingInsert): Promise<DbBooking> {
    const { data, error } = await this.client
      .from('bookings')
      .insert([booking])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: BookingUpdate): Promise<DbBooking> {
    const { data, error } = await this.client
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('bookings')
      .delete()
      .eq('id', id);

    return !error;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<DbBooking> {
    const { data, error } = await this.client
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, service:services(*), business:profiles!business_id(*)')
      .eq('customer_id', customerId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getByBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customer:profiles!customer_id(*), service:services(*)')
      .eq('business_id', businessId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async create(booking: BookingInsert) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select('*, customer:profiles!customer_id(*), service:services(*), business:profiles!business_id(*)')
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: BookingUpdate) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select('*, customer:profiles!customer_id(*), service:services(*), business:profiles!business_id(*)')
      .single();

    if (error) throw error;
    return data;
  }

  static async updateStatus(id: string, status: BookingStatus) {
    return this.update(id, { status });
  }

  static async cancel(id: string) {
    return this.updateStatus(id, 'cancelled');
  }

  static async confirm(id: string) {
    return this.updateStatus(id, 'confirmed');
  }

  static async complete(id: string) {
    return this.updateStatus(id, 'completed');
  }

  static async getUpcoming(userId: string, role: 'customer' | 'business') {
    const column = role === 'customer' ? 'customer_id' : 'business_id';
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customer:profiles!customer_id(*), service:services(*), business:profiles!business_id(*)')
      .eq(column, userId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async checkAvailability(businessId: string, startTime: string, endTime: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('business_id', businessId)
      .in('status', ['pending', 'confirmed'])
      .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

    if (error) throw error;
    return data.length === 0;
  }

  async validateBookingSlot(): Promise<boolean> {
    // Implement booking validation logic
    return true;
  }

  async handleBookingConflicts(): Promise<void> {
    // Implement conflict detection
  }
}

// Create a singleton instance
export const bookingService = new BookingService(); 