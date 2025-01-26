import { createBrowserClient } from '@supabase/ssr';
import { Service } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getService(id: string): Promise<Service | null> {
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

export async function createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service | null> {
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  try {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    return null;
  }
}

export async function updateService(id: string, service: Partial<Service>): Promise<Service | null> {
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  try {
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating service:', error);
    return null;
  }
}

export async function deleteService(id: string): Promise<boolean> {
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  try {
    const { error } = await supabase
      .from('services')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting service:', error);
    return false;
  }
}

export const getServicesByBusiness = async (businessId: string): Promise<Service[]> => {

  const response = await fetch(`/api/businesses/${businessId}/services`);

  if (!response.ok) throw new Error('Failed to fetch services');

  return response.json();

};

export async function getFeaturedServices(): Promise<Service[]> {
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'active')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured services:', error);
    return [];
  }
}
