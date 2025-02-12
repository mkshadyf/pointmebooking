import { supabase } from '../client';
import { Database } from '../types/database';

type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export class ServiceService {
  static async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*, business:profiles(*), category:categories(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*, business:profiles(*), category:categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getByBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*, category:categories(*)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*, business:profiles(*)')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async create(service: ServiceInsert) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select('*, business:profiles(*), category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: ServiceUpdate) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select('*, business:profiles(*), category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    // Soft delete by updating status
    const { error } = await supabase
      .from('services')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (error) throw error;
    return true;
  }
} 