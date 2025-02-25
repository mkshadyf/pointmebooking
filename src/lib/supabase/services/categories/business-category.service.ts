import { supabase } from '@/lib/supabase/client';
import { BusinessCategory } from '@/lib/supabase/types';
import type { Database } from '@generated.types';
import { BaseService } from '../BaseService';

type Tables = Database['public']['Tables'];
type BusinessCategoryTable = Tables['business_categories'];
type ServiceCategoryTable = Tables['service_categories'];

export class BusinessCategoryService extends BaseService<'business_categories'> {
  private static instance: BusinessCategoryService;

  protected constructor() {
    super(supabase, 'business_categories');
  }

  public static getInstance(): BusinessCategoryService {
    if (!BusinessCategoryService.instance) {
      BusinessCategoryService.instance = new BusinessCategoryService();
    }
    return BusinessCategoryService.instance;
  }

  async getBusinessCategories(): Promise<BusinessCategory[]> {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      return this.handleError(error);
    }
  }

  override async getAll(): Promise<BusinessCategoryTable['Row'][]> {
    return super.getAll();
  }

  override async getById(id: string): Promise<BusinessCategoryTable['Row']> {
    return super.getById(id);
  }

  async getWithServices(id: string): Promise<BusinessCategoryTable['Row'] & { service_categories: ServiceCategoryTable['Row'][] }> {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select(`*, service_categories(*)`)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Handle potential error in the relationship
      const serviceCategories = Array.isArray(data.service_categories) 
        ? data.service_categories 
        : [];
        
      return {
        ...data,
        service_categories: serviceCategories
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  override async create(category: BusinessCategoryTable['Insert']): Promise<BusinessCategoryTable['Row']> {
    return super.create(category);
  }

  override async update(
    id: string,
    updates: BusinessCategoryTable['Update']
  ): Promise<BusinessCategoryTable['Row']> {
    return super.update(id, updates);
  }

  override async delete(id: string): Promise<boolean> {
    return super.delete(id);
  }
}

export const businessCategoryService = BusinessCategoryService.getInstance(); 