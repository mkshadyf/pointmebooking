import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { Database } from '@/types/database/generated.types';
import { BaseServiceUtils } from '../BaseService';


// Define a type for valid table names
type TableName = "services" | "bookings" | "businesses" | "profiles" | "business_categories" | "error_logs" | "schedules" | "staff" | "service_categories";

// Define search options interface
export interface SearchOptions {
  limit?: number;
  page?: number;
  offset?: number;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define service with relations type
export type ServiceWithRelations = Database['public']['Tables']['services']['Row'] & {
  business: Database['public']['Tables']['profiles']['Row'];
  category: Database['public']['Tables']['service_categories']['Row'];
};

// Define profile with services type
export type ProfileWithServices = Database['public']['Tables']['profiles']['Row'] & {
  services: Database['public']['Tables']['services']['Row'][];
};

// Define paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Search service class
export class SearchService extends BaseServiceUtils {
  private static instance: SearchService;
  
  private constructor() {
    super();
  }
  
  /**
   * Get the singleton instance of SearchService
   */
  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }
  
  /**
   * Static method to search services
   * @param query Search query string
   * @param options Search options
   * @returns Paginated response of services
   */
  public static searchServices(query: string, options: SearchOptions = {}): Promise<PaginatedResponse<ServiceWithRelations>> {
    return SearchServiceStatic.searchServices(query, options);
  }
  
  /**
   * Build pagination parameters
   */
  private buildPagination(options: SearchOptions) {
    const limit = options.limit || 10;
    const page = options.page || 1;
    const offset = options.offset || (page - 1) * limit;
    
    return {
      limit,
      page,
      offset
    };
  }
  
  /**
   * Format paginated response
   */
  private formatPaginatedResponse<T>(
    data: T[],
    total: number | null = 0,
    pagination: { page: number; limit: number }
  ): PaginatedResponse<T> {
    const totalCount = total || 0;
    const totalPages = Math.ceil(totalCount / pagination.limit);
    
    return {
      data,
      pagination: {
        total: totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages
      }
    };
  }
  
  /**
   * Build search query with filters
   */
  private buildSearchQuery(query: any, searchTerm: string, options: SearchOptions, config: {
    searchField: string;
    categoryField?: string;
    addressField?: string;
  }) {
    // Apply search term filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      query = query.ilike(config.searchField, `%${searchTerm}%`);
    }
    
    // Apply category filter if provided
    if (options.category && config.categoryField) {
      query = query.eq(config.categoryField, options.category);
    }
    
    // Apply location filter if provided
    if (options.location && config.addressField) {
      query = query.ilike(config.addressField, `%${options.location}%`);
    }
    
    // Apply price range filters if provided
    if (options.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }
    
    if (options.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
    }
    
    // Apply sorting if provided
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    return query;
  }
  
  /**
   * Execute search with pagination and filters
   */
  private async executeSearch<T>(
    table: TableName,
    searchTerm: string,
    options: SearchOptions,
    config: {
      searchField: string;
      relations?: string;
      categoryField?: string;
      addressField?: string;
    }
  ): Promise<PaginatedResponse<T>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const pagination = this.buildPagination(options);
        
        // Start building the query
        let query = client.from(table).select(
          config.relations ? `*, ${config.relations}` : '*',
          { count: 'exact' }
        );
        
        // Apply filters
        query = this.buildSearchQuery(query, searchTerm, options, config);
        
        // Apply pagination
        query = query.range(
          pagination.offset,
          pagination.offset + pagination.limit - 1
        );
        
        // Execute the query
        const { data, error, count } = await query;

      if (error) {
          console.error(`Error searching ${table}:`, error);
          return this.formatPaginatedResponse([], 0, pagination);
        }
        
        return this.formatPaginatedResponse(data as unknown as T[], count, pagination);
      } catch (error) {
        console.error(`Error in executeSearch for ${table}:`, error);
        return this.formatPaginatedResponse([], 0, this.buildPagination(options));
      }
    });
  }
  
  /**
   * Search services with filters and pagination
   */
  async searchServices(query: string, options: SearchOptions = {}) {
      return this.executeSearch<ServiceWithRelations>(
      'services',
        query,
        options,
        {
          searchField: 'name',
        relations: 'business:profiles(*), category:service_categories(*)',
        categoryField: 'category_id'
      }
    );
  }
  
  /**
   * Search businesses with filters and pagination
   */
  async searchBusinesses(query: string, options: SearchOptions = {}) {
    const sortBy = options.sortBy || 'created_at';
    
    return this.executeSearch<ProfileWithServices>(
      'profiles',
      query,
      { ...options, sortBy },
      {
        searchField: 'full_name',
        relations: 'services(*)',
        addressField: 'address'
      }
    );
  }

  /**
   * Search categories with filters and pagination
   */
  async searchCategories(query: string, options: SearchOptions = {}) {
    return this.executeSearch(
      'service_categories',
      query,
      options,
      {
        searchField: 'name'
      }
    );
  }
  
  /**
   * Get popular categories
   */
  async getPopularCategories(limit: number = 10) {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
      .from('service_categories')
          .select('*')
          .order('service_count', { ascending: false })
          .limit(limit);

    if (error) {
          console.error('Error getting popular categories:', error);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('Error in getPopularCategories:', error);
        return [];
      }
    });
  }
  
  /**
   * Get recent services
   */
  async getRecentServices(limit: number = 10) {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
        .from('services')
          .select('*, business:profiles(*), category:service_categories(*)')
        .order('created_at', { ascending: false })
        .limit(limit);

        if (error) {
          console.error('Error getting recent services:', error);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('Error in getRecentServices:', error);
        return [];
      }
    });
  }
  
  /**
   * Get featured services
   */
  async getFeaturedServices(limit: number = 6) {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('services')
          .select('*, business:profiles(*), category:service_categories(*)')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(limit);

      if (error) {
          console.error('Error getting featured services:', error);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('Error in getFeaturedServices:', error);
        return [];
      }
    });
  }
  
  /**
   * Search by location
   */
  async searchByLocation(query: string, options: SearchOptions = {}) {
    return this.searchServices(query, {
      ...options,
      location: query
    });
  }
  
  /**
   * Search by category
   */
  async searchByCategory(query: string, options: SearchOptions = {}) {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // First find the category ID
        const { data: categories, error: categoryError } = await client
          .from('service_categories')
          .select('id')
          .ilike('name', `%${query}%`)
          .limit(1);
        
        if (categoryError || !categories || categories.length === 0) {
          console.error('Error finding category:', categoryError);
          return this.formatPaginatedResponse([], 0, this.buildPagination(options));
        }
        
        // Then search services with that category ID
        const categoryId = categories[0].id;
        return this.searchServices('', {
          ...options,
          category: categoryId
        });
      } catch (error) {
        console.error('Error in searchByCategory:', error);
        return this.formatPaginatedResponse([], 0, this.buildPagination(options));
      }
    });
  }
}

// Export the singleton instance
export const searchService = SearchService.getInstance();

// Static wrapper for backward compatibility
export class SearchServiceStatic extends BaseServiceUtils {
  static async searchServices(query: string, options: SearchOptions = {}) {
    return searchService.searchServices(query, options);
  }
  
  static async searchBusinesses(query: string, options: SearchOptions = {}) {
    return searchService.searchBusinesses(query, options);
  }
  
  static async searchCategories(query: string, options: SearchOptions = {}) {
    return searchService.searchCategories(query, options);
  }
  
  static async getPopularCategories(limit: number = 10) {
    return searchService.getPopularCategories(limit);
  }
  
  static async getRecentServices(limit: number = 10) {
    return searchService.getRecentServices(limit);
  }
  
  static async getFeaturedServices(limit: number = 10) {
    return searchService.getFeaturedServices(limit);
  }
  
  static async searchByCategory(query: string, options: SearchOptions = {}) {
    return searchService.searchByCategory(query, options);
  }
  
  static async searchByLocation(query: string, options: SearchOptions = {}) {
    return searchService.searchByLocation(query, options);
  }
} 