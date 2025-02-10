import { Service } from '@/types';
import { createBrowserClient } from '@supabase/ssr';
import { handleClientError } from '../errors/handlers';

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

  try {
    // Add artificial delay in development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // First get the services
    let servicesQuery = supabase
      .from('services')
      .select(`
        *,
        business:businesses (
          id,
          business_name,
          address,
          city,
          state,
          phone,
          email,
          logo_url
        ),
        category:categories (
          id,
          name,
          icon
        )
      `)
      .eq('status', 'active')
      .eq('is_available', true);

    // Apply filters
    if (params.query) {
      servicesQuery = servicesQuery.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
    }

    if (params.category) {
      servicesQuery = servicesQuery.eq('category_id', params.category);
    }

    if (params.minPrice !== undefined) {
      servicesQuery = servicesQuery.gte('price', params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      servicesQuery = servicesQuery.lte('price', params.maxPrice);
    }

    if (params.duration) {
      servicesQuery = servicesQuery.eq('duration', params.duration);
    }

    // Handle location filter
    if (params.location) {
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .or(`city.ilike.%${params.location}%,state.ilike.%${params.location}%`);
      
      if (businesses && businesses.length > 0) {
        servicesQuery = servicesQuery.in('business_id', businesses.map(b => b.id));
      } else {
        return []; // No businesses found in location
      }
    }

    const { data: services, error: servicesError } = await servicesQuery;

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      throw servicesError;
    }

    if (!services) return [];

    // Transform the data to match our Service type
    return services.map((item: any) => ({
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
      business: item.business ? {
        id: item.business.id,
        name: item.business.business_name,
        address: item.business.address,
        city: item.business.city,
        state: item.business.state,
        phone: item.business.phone,
        email: item.business.email,
        logo_url: item.business.logo_url,
      } : undefined,
      category: item.category ? {
        name: item.category.name,
        icon: item.category.icon
      } : undefined
    }));
  } catch (error) {
    console.error('Error in searchServices:', error);
    await handleClientError(error);
    return []; // Return empty array instead of throwing to prevent UI errors
  }
}

export function filterServicesByText(services: Service[], searchText: string): Service[] {
  if (!searchText) return services;
  
  const searchLower = searchText.toLowerCase();
  return services.filter(service => 
    service.name.toLowerCase().includes(searchLower) ||
    (service.description?.toLowerCase().includes(searchLower) ?? false)
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
