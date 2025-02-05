import { Service } from '@/types';
import { createBrowserClient } from '@supabase/ssr';

interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  location?: string;
}

export async function searchServices(filters: SearchFilters = {}): Promise<Service[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  let query = supabase
    .from('services')
    .select(`
      id,
      name,
      description,
      price,
      duration,
      category_id,
      image_url,
      status,
      is_available,
      created_at,
      updated_at,
      business:business_id(
        id,
        business_name,
        address,
        city,
        state,
        contact_number,
        contact_email,
        logo_url
      )
    `);

  // Apply text search
  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }

  // Apply category filter
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  // Apply price range filter
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  // Apply duration filter
  if (filters.duration) {
    query = query.eq('duration', filters.duration);
  }

  // Apply location filter
  if (filters.location) {
    query = query.eq('business.location', filters.location);
  }

  const { data, error } = await query;

  if (error) {
    // Create a fallback error message if error.message is missing
    const errorMessage =
      (error as { message?: string }).message ||
      JSON.stringify(error) ||
      'Unknown error searching services';
    console.error('Error searching services:', errorMessage);
    throw new Error(errorMessage);
  }

  return (data || []).map(item => ({
    id: item.id,
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
    business_id: item.business?.[0]?.id,
    business: item.business?.[0]
      ? {
          id: item.business[0].id,
          name: item.business[0].business_name,
          address: item.business[0].address,
          city: item.business[0].city,
          state: item.business[0].state,
          phone: item.business[0].contact_number,
          email: item.business[0].contact_email,
          logo_url: item.business[0].logo_url,
        }
      : undefined,
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
