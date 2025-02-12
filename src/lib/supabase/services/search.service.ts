import { supabase } from '../client';
import type { Category, PaginatedResponse, Profile, Service } from '../types';

export class SearchService {
  static async searchServices(query: string, options: {
    limit?: number;
    page?: number;
    category?: string;
    location?: string;
  } = {}) {
    const {
      limit = 10,
      page = 1,
      category,
      location,
    } = options;

    const offset = (page - 1) * limit;

    let query_builder = supabase
      .from('services')
      .select('*, business:profiles(*), category:categories(*)', { count: 'exact' })
      .textSearch('name', query, {
        type: 'websearch',
        config: 'english',
      })
      .eq('status', 'active');

    if (category) {
      query_builder = query_builder.eq('category_id', category);
    }

    if (location) {
      query_builder = query_builder.textSearch('business.address', location, {
        type: 'websearch',
        config: 'english',
      });
    }

    const { data, error, count } = await query_builder
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data as (Service & { business: Profile; category: Category })[],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    } as PaginatedResponse<Service & { business: Profile; category: Category }>;
  }

  static async getFeaturedServices(limit: number = 6) {
    const { data, error } = await supabase
      .from('services')
      .select('*, business:profiles(*), category:categories(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as (Service & { business: Profile; category: Category })[];
  }

  static async searchBusinesses(query: string, options: {
    limit?: number;
    page?: number;
    category?: string;
    location?: string;
  } = {}) {
    const {
      limit = 10,
      page = 1,
      category,
      location,
    } = options;

    const offset = (page - 1) * limit;

    let query_builder = supabase
      .from('profiles')
      .select('*, services!inner(*)', { count: 'exact' })
      .eq('role', 'business')
      .textSearch('business_name', query, {
        type: 'websearch',
        config: 'english',
      });

    if (category) {
      query_builder = query_builder.eq('services.category_id', category);
    }

    if (location) {
      query_builder = query_builder.textSearch('address', location, {
        type: 'websearch',
        config: 'english',
      });
    }

    const { data, error, count } = await query_builder
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data as (Profile & { services: Service[] })[],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    } as PaginatedResponse<Profile & { services: Service[] }>;
  }

  static async searchCategories(query: string, options: {
    limit?: number;
    page?: number;
  } = {}) {
    const {
      limit = 10,
      page = 1,
    } = options;

    const offset = (page - 1) * limit;

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

    return {
      data: data.map(category => ({
        ...category,
        service_count: category.services?.[0]?.count ?? 0,
      })) as (Category & { service_count: number })[],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    } as PaginatedResponse<Category & { service_count: number }>;
  }
} 