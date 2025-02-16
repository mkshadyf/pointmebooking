import { supabase } from '../client';
import type { DbCategory, DbProfile, DbService } from '../types';
import { BaseSearchService } from './BaseSearchService';

interface SearchOptions {
  limit?: number;
  page?: number;
  category?: string;
  location?: string;
}

type ServiceWithRelations = DbService & { business: DbProfile; category: DbCategory };
type ProfileWithServices = DbProfile & { services: DbService[] };
type CategoryWithCount = DbCategory & { service_count: number };

export class SearchService extends BaseSearchService {
  private static async executeSearch<T>(
    table: string,
    searchTerm: string,
    options: SearchOptions,
    config: {
      searchField: string;
      relations?: string;
      categoryField?: string;
      addressField?: string;
    }
  ) {
    const { limit, page, offset } = this.buildPagination(options);

    let query = supabase
      .from(table)
      .select(config.relations || '*', { count: 'exact' });

    query = this.buildSearchQuery(query, searchTerm, options, {
      searchField: config.searchField,
      categoryField: config.categoryField,
      addressField: config.addressField
    });

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.formatPaginatedResponse(
      data as T[],
      count,
      { page, limit }
    );
  }

  static async searchServices(query: string, options: SearchOptions = {}) {
    return this.executeSearch<ServiceWithRelations>(
      'services',
      query,
      options,
      {
        searchField: 'name',
        relations: '*, business:profiles(*), category:categories(*)',
        categoryField: 'category_id',
        addressField: 'business.address'
      }
    );
  }

  static async searchBusinesses(query: string, options: SearchOptions = {}) {
    return this.executeSearch<ProfileWithServices>(
      'profiles',
      query,
      options,
      {
        searchField: 'business_name',
        relations: '*, services!inner(*)',
        addressField: 'address'
      }
    );
  }

  static async searchCategories(query: string, options: {
    limit?: number;
    page?: number;
  } = {}) {
    const { limit, page, offset } = this.buildPagination(options);

    const { data, error, count } = await supabase
      .from('categories')
      .select('*, services:services(count)', { count: 'exact' })
      .textSearch('name', query, {
        type: 'websearch',
        config: 'english',
      })
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

    if (error) throw error;

    const formattedData = data.map(category => ({
      ...category,
      service_count: category.services?.[0]?.count ?? 0,
    })) as CategoryWithCount[];

    return this.formatPaginatedResponse(formattedData, count, { page, limit });
  }

  static async getFeaturedServices(limit: number = 6) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          business:profiles!services_business_id_fkey (
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
            name,
            icon
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching featured services:', error);
      throw error;
    }
  }
} 