import { mediumCache } from '@/lib/cache';
import { Database } from '@generated.types';
import { supabase } from '../client';
import { BaseServiceUtils } from './BaseService';

// Define proper types from the generated database types
export type DbService = Database['public']['Tables']['services']['Row'];
export type ServiceInsert = Database['public']['Tables']['services']['Insert'];
export type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export class ServiceService extends BaseServiceUtils {
  private static getCacheKey(method: string, params?: string): string {
    return `service:${method}${params ? `:${params}` : ''}`;
  }

  static async getAll(): Promise<DbService[]> {
    const cacheKey = this.getCacheKey('getAll');
    
    return mediumCache.getOrSet(cacheKey, async () => {
      return await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*');

        if (error) throw error;
        return data || [];
      }, { context: 'ServiceService.getAll' });
    });
  }

  static async getById(id: string): Promise<DbService | null> {
    const cacheKey = this.getCacheKey('getById', id);
    
    return mediumCache.getOrSet(cacheKey, async () => {
      return await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          // If not found, don't throw but return null
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        return data;
      }, { context: 'ServiceService.getById' });
    });
  }

  static async getByBusiness(businessId: string): Promise<DbService[]> {
    const cacheKey = this.getCacheKey('getByBusiness', businessId);
    
    return mediumCache.getOrSet(cacheKey, async () => {
      return await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', businessId);

        if (error) throw error;
        return data || [];
      }, { context: 'ServiceService.getByBusiness' });
    });
  }

  static async create(service: ServiceInsert): Promise<DbService> {
    // Don't cache mutations
    return await this.withRetry(async () => {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate relevant caches
      mediumCache.delete(this.getCacheKey('getAll'));
      if (service.business_id) {
        mediumCache.delete(this.getCacheKey('getByBusiness', service.business_id));
      }
      if (service.category_id) {
        mediumCache.delete(this.getCacheKey('getByCategory', service.category_id));
      }
      
      return data;
    }, { context: 'ServiceService.create' });
  }

  static async update(id: string, service: ServiceUpdate): Promise<DbService> {
    // Don't cache mutations
    return await this.withRetry(async () => {
      const { data, error } = await supabase
        .from('services')
        .update(service)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate relevant caches
      mediumCache.delete(this.getCacheKey('getAll'));
      mediumCache.delete(this.getCacheKey('getById', id));
      if (service.business_id) {
        mediumCache.delete(this.getCacheKey('getByBusiness', service.business_id));
      }
      if (service.category_id) {
        mediumCache.delete(this.getCacheKey('getByCategory', service.category_id));
      }
      
      return data;
    }, { context: 'ServiceService.update' });
  }

  static async delete(id: string): Promise<boolean> {
    // Get the service first to know which caches to invalidate
    const service = await this.getById(id);
    
    return await this.withRetry(async () => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Invalidate relevant caches
      mediumCache.delete(this.getCacheKey('getAll'));
      mediumCache.delete(this.getCacheKey('getById', id));
      if (service?.business_id) {
        mediumCache.delete(this.getCacheKey('getByBusiness', service.business_id));
      }
      if (service?.category_id) {
        mediumCache.delete(this.getCacheKey('getByCategory', service.category_id));
      }
      
      return true;
    }, { context: 'ServiceService.delete' });
  }

  static async getByCategory(categoryId: string): Promise<DbService[]> {
    const cacheKey = this.getCacheKey('getByCategory', categoryId);
    
    return mediumCache.getOrSet(cacheKey, async () => {
      return await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('category_id', categoryId);

        if (error) throw error;
        return data || [];
      }, { context: 'ServiceService.getByCategory' });
    });
  }
} 