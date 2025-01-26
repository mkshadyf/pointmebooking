import { createBrowserClient } from '@supabase/ssr';
import { Service } from '@/types';

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
      *,
      business:business_id (
        id,
        business_name,
        location
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
    console.error('Error searching services:', error);
    throw error;
  }

  return data || [];
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
