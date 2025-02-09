import { Service } from '@/types';
import { createBrowserClient } from '@supabase/ssr';

interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  location?: string;
}

export async function searchServices(params: SearchParams): Promise<Service[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from('service_details')
    .select('*')
    .eq('status', 'active')
    .eq('is_available', true);

  // Apply filters
  if (params.query) {
    query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
  }

  if (params.category) {
    query = query.eq('category_id', params.category);
  }

  if (params.minPrice !== undefined) {
    query = query.gte('price', params.minPrice);
  }

  if (params.maxPrice !== undefined) {
    query = query.lte('price', params.maxPrice);
  }

  if (params.duration) {
    query = query.eq('duration', params.duration);
  }

  if (params.location) {
    query = query.or(`business_city.ilike.%${params.location}%,business_state.ilike.%${params.location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching services:', error);
    return [];
  }

  // Transform the data to match our Service type
  return data.map((item: any) => ({
    id: item.id,
    business_id: item.business_id,
    name: item.name,
    description: item.description,
    price: item.price,
    duration: item.duration,
    category_id: item.category_id,
    image_url: item.image_url,
    status: item.status,
    is_available: item.is_available,
    created_at: item.created_at,
    updated_at: item.updated_at,
    business: {
      id: item.business_id,
      name: item.business_name,
      address: item.business_address,
      city: item.business_city,
      state: item.business_state,
      phone: item.business_phone,
      email: item.business_email,
      logo_url: item.business_logo_url,
    },
    category: {
      name: item.category_name,
      icon: item.category_icon
    }
  }));
}

export function filterServicesByText(services: Service[], searchText: string): Service[] {
  if (!searchText) return services;
  
  const searchLower = searchText.toLowerCase();
  return services.filter(service => 
    service.name.toLowerCase().includes(searchLower) ||
    service.description.toLowerCase().includes(searchLower)
  );
}

export function filterServicesByPrice(services: Service[], minPrice?: number, maxPrice?: number): Service[] {
  return services.filter(service => {
    if (minPrice !== undefined && service.price < minPrice) return false;
    if (maxPrice !== undefined && service.price > maxPrice) return false;
    return true;
  });
}

export function filterServicesByDuration(services: Service[], duration?: number): Service[] {
  if (!duration) return services;
  return services.filter(service => service.duration === duration);
}
