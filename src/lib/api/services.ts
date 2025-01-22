import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Service } from '@/types';

const supabase = createClientComponentClient();

export async function createService(service: Service) {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateService(id: string, service: Partial<Service>) {
  const { data, error } = await supabase
    .from('services')
    .update(service)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteService(id: string) {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getServicesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId);

  if (error) throw error;
  return data;
}

export async function getServiceById(id: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
