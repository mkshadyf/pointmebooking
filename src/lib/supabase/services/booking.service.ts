import { BOOKING_STATUSES } from '@/types';
import { supabase } from '../client';
import type { BookingInsert, BookingUpdate, DbBooking } from '../types';

type BookingStatus = typeof BOOKING_STATUSES[number];

export class BookingService {
  static async getAll(filters: {
    status?: BookingStatus;
    business_id?: string;
    customer_id?: string;
  } = {}) {
    let query = supabase.from('bookings').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.business_id) {
      query = query.eq('business_id', filters.business_id);
    }
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as DbBooking[];
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customer:profiles!customer_id(*), service:services(*), business:profiles!business_id(*)')
      .eq('id', id)
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
} 