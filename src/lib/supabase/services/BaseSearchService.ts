import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { PaginatedResponse } from '../types';

export interface SearchOptions {
  limit?: number;
  page?: number;
  category?: string;
  location?: string;
}

export class BaseSearchService {
  protected static buildPagination(options: SearchOptions) {
    const {
      limit = 10,
      page = 1,
    } = options;

    const offset = (page - 1) * limit;
    return { limit, page, offset };
  }

  protected static formatPaginatedResponse<T>(
    data: T[],
    count: number | null,
    { page, limit }: { page: number; limit: number }
  ): PaginatedResponse<T> {
    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  protected static buildSearchQuery<T = any>(
    query: PostgrestFilterBuilder<any, any, T[], string, any>,
    searchTerm: string,
    options: SearchOptions,
    config: {
      searchField: string;
      addressField?: string;
      categoryField?: string;
    }
  ) {
    let result = query.textSearch(config.searchField, searchTerm, {
      type: 'websearch',
      config: 'english',
    });

    if (options.category && config.categoryField) {
      result = result.eq(config.categoryField, options.category);
    }

    if (options.location && config.addressField) {
      result = result.textSearch(config.addressField, options.location, {
        type: 'websearch',
        config: 'english',
      });
    }

    return result;
  }
} 