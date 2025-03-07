import { Database } from '@/types/database/generated.types';
import { BaseService } from './BaseService';
import { supabaseClientService } from './core/supabase-client.service';
import { ServiceServiceStatic as ServiceService } from './service/service.service';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type ServiceWithRelations = Database['public']['Tables']['services']['Row'] & {
  business: Database['public']['Tables']['businesses']['Row'] | null;
  category: Database['public']['Tables']['service_categories']['Row'] | null;
};

export class SearchService extends BaseService<'services'> {
  private static instance: SearchService;

  private constructor() {
    // Initialize with the browser client, but methods will use getClient() for proper context
    const client = supabaseClientService.getBrowserClient();
    super(client, 'services');
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Search for services based on query and category
   */
  public static async searchServices(
    query?: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<ServiceWithRelations>> {
    
    try {
      // Get all services first
      const allServices = await ServiceService.getAll();
      
      // Filter by query and category
      let filteredServices = allServices;
      
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredServices = filteredServices.filter(service => 
          service.name.toLowerCase().includes(lowerQuery) || 
          (service.description && service.description.toLowerCase().includes(lowerQuery))
        );
      }
      
      if (categoryId) {
        filteredServices = filteredServices.filter(service => 
          service.category_id === categoryId
        );
      }
      
      // Calculate pagination
      const total = filteredServices.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedServices = filteredServices.slice(offset, offset + limit);
      
      // Add relations (simplified for now)
      const servicesWithRelations = paginatedServices.map(service => ({
        ...service,
        business: null,
        category: null
      }));
      
      return {
        data: servicesWithRelations,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error searching services:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Get featured services
   */
  public static async getFeaturedServices(): Promise<ServiceWithRelations[]> {
    
    try {
      // Get all services first
      const allServices = await ServiceService.getAll();
      
      // Filter for featured services
      const featuredServices = allServices.filter(service => 
        service.featured === true
      );
      
      // Add relations (simplified for now)
      const servicesWithRelations = featuredServices.map(service => ({
        ...service,
        business: null,
        category: null
      }));
      
      return servicesWithRelations;
    } catch (error) {
      console.error('Error getting featured services:', error);
      return [];
    }
  }
}

export const searchService = SearchService.getInstance(); 