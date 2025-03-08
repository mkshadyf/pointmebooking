import { mediumCache } from '@/lib/cache';
import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { Database } from '@/types/database/generated.types';
import { BaseService, BaseServiceUtils } from '../BaseService';
import { adminService } from '../admin/admin.service';

// Define proper types from the generated database types
export type DbService = Database['public']['Tables']['services']['Row'];
export type ServiceInsert = Database['public']['Tables']['services']['Insert'];
export type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export class ServiceService extends BaseService<'services'> {
  private static instance: ServiceService;

  private constructor() {
    // Initialize with the browser client, but methods will use getClient() for proper context
    const client = supabaseClientService.getBrowserClient();
    super(client, 'services');
  }

  public static getInstance(): ServiceService {
    if (!ServiceService.instance) {
      ServiceService.instance = new ServiceService();
    }
    return ServiceService.instance;
  }

  private getCacheKey(method: string, params?: string): string {
    return `service:${method}${params ? `:${params}` : ''}`;
  }

  override async getAll(): Promise<DbService[]> {
    const cacheKey = this.getCacheKey('getAll');
    
    return mediumCache.getOrSet(cacheKey, async () => {
      try {
        const client = await supabaseClientService.getClient();
        const { data, error } = await client
          .from(this.table)
          .select('*');

        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Get a service by ID
   * @param id The service ID
   * @returns The service or null if not found
   */
  async getByIdOrNull(id: string): Promise<DbService | null> {
    const cacheKey = this.getCacheKey('getById', id);
    
    return mediumCache.getOrSet(cacheKey, async () => {
      try {
        const client = await supabaseClientService.getClient();
        const { data, error } = await client
          .from(this.table)
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
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Get a service by ID
   * @param id The service ID
   * @returns The service
   * @throws Error if service not found
   */
  override async getById(id: string): Promise<DbService> {
    const service = await this.getByIdOrNull(id);
    if (!service) {
      throw new Error(`Service with ID ${id} not found`);
    }
    return service;
  }

  async getByBusiness(businessId: string): Promise<DbService[]> {
    const cacheKey = this.getCacheKey('getByBusiness', businessId);
    
    return mediumCache.getOrSet(cacheKey, async () => {
      try {
        const client = await supabaseClientService.getClient();
        const { data, error } = await client
          .from(this.table)
          .select('*')
          .eq('business_id', businessId)
          .order('name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  async getActiveByBusiness(businessId: string): Promise<DbService[]> {
    const cacheKey = this.getCacheKey('getActiveByBusiness', businessId);
    
    return mediumCache.getOrSet(cacheKey, async () => {
      try {
        const client = await supabaseClientService.getClient();
        const { data, error } = await client
          .from(this.table)
          .select('*')
          .eq('business_id', businessId)
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  override async create(service: ServiceInsert): Promise<DbService> {
    try {
      const client = await supabaseClientService.getClient();
      const { data, error } = await client
        .from(this.table)
        .insert([service])
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate relevant caches
      this.invalidateServiceCaches(data);
      
      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  override async update(id: string, service: ServiceUpdate): Promise<DbService> {
    try {
      const client = await supabaseClientService.getClient();
      const { data, error } = await client
        .from(this.table)
        .update(service)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate relevant caches
      this.invalidateServiceCaches(data, id);
      
      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update the approval status of a service
   * This is a convenience method that delegates to adminService
   * @param id The ID of the service to update
   * @param status The new approval status
   * @param adminNotes Optional notes from the admin
   * @returns The updated service
   * @deprecated Use adminService directly instead
   */
  async updateApprovalStatus(id: string, status: Database['public']['Enums']['approval_status'], adminNotes?: string): Promise<DbService> {
    let result: DbService;
    
    // Call the appropriate admin method based on the status
    if (status === 'approved') {
      const response = await adminService.approveService(id);
      if (response.error) throw new Error(response.error);
      result = response.data as unknown as DbService;
    } else if (status === 'rejected') {
      const response = await adminService.rejectService(id, adminNotes || 'No reason provided');
      if (response.error) throw new Error(response.error);
      result = response.data as unknown as DbService;
    } else {
      // For other statuses, update directly
      const update: ServiceUpdate = {
        approval_status: status,
        ...(adminNotes && { admin_notes: adminNotes })
      };
      result = await this.update(id, update);
    }
    
    // Invalidate relevant caches
    this.invalidateServiceCaches(result, id);
    
    return result;
  }

  override async delete(id: string): Promise<boolean> {
    // Get the service first to know which caches to invalidate
    const service = await this.getByIdOrNull(id);
    
    try {
      const client = await supabaseClientService.getClient();
      const { error } = await client
        .from(this.table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Invalidate relevant caches
      if (service) {
        this.invalidateServiceCaches(service, id);
      }
      
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByCategory(categoryId: string): Promise<DbService[]> {
    const cacheKey = this.getCacheKey('getByCategory', categoryId);
    
    return mediumCache.getOrSet(cacheKey, async () => {
      try {
        const client = await supabaseClientService.getClient();
        const { data, error } = await client
          .from(this.table)
          .select('*')
          .eq('category_id', categoryId)
          .order('name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  async getActiveByCategory(categoryId: string): Promise<DbService[]> {
    const cacheKey = this.getCacheKey('getActiveByCategory', categoryId);
    
    return mediumCache.getOrSet(cacheKey, async () => {
      try {
        const client = await supabaseClientService.getClient();
        const { data, error } = await client
          .from(this.table)
          .select('*')
          .eq('category_id', categoryId)
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Get services with pending approval status
   * This is a convenience method that delegates to adminService
   * @returns List of services with pending approval
   * @deprecated Use adminService.getPendingServices instead
   */
  async getPendingApproval(): Promise<DbService[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from(this.table)
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    });
  }

  /**
   * Helper method to invalidate all relevant caches for a service
   */
  private invalidateServiceCaches(service: DbService, id?: string): void {
    mediumCache.delete(this.getCacheKey('getAll'));
    
    if (id) {
      mediumCache.delete(this.getCacheKey('getById', id));
    }
    
    if (service.business_id) {
      mediumCache.delete(this.getCacheKey('getByBusiness', service.business_id));
      mediumCache.delete(this.getCacheKey('getActiveByBusiness', service.business_id));
    }
    
    if (service.category_id) {
      mediumCache.delete(this.getCacheKey('getByCategory', service.category_id));
      mediumCache.delete(this.getCacheKey('getActiveByCategory', service.category_id));
    }
  }

  /**
   * Get a service by ID with related business and category data
   * @param id The service ID
   * @returns The service with related data or null if not found
   */
  async getByIdWithRelations(id: string): Promise<{
    data: DbService & { 
      businesses?: Database['public']['Tables']['businesses']['Row'] | null; 
      service_categories?: Database['public']['Tables']['service_categories']['Row'] | null;
    } | null;
    error: Error | null;
  }> {
    
    try {
      const client = await supabaseClientService.getClient();
      const { data, error } = await client
        .from(this.table)
        .select(`
          *,
          businesses(*),
          service_categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        // If not found, don't throw but return null
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  }
}

// Export a singleton instance
export const serviceService = ServiceService.getInstance();

// For backward compatibility, expose static methods
export class ServiceServiceStatic extends BaseServiceUtils {
  static async getAll(): Promise<DbService[]> {
    return serviceService.getAll();
  }
  
  static async getById(id: string): Promise<DbService | null> {
    return serviceService.getByIdOrNull(id);
  }
  
  static async getByBusiness(businessId: string): Promise<DbService[]> {
    return serviceService.getByBusiness(businessId);
  }
  
  static async getActiveByBusiness(businessId: string): Promise<DbService[]> {
    return serviceService.getActiveByBusiness(businessId);
  }
  
  static async create(service: ServiceInsert): Promise<DbService> {
    return serviceService.create(service);
  }
  
  static async update(id: string, service: ServiceUpdate): Promise<DbService> {
    return serviceService.update(id, service);
  }
  
  static async updateApprovalStatus(id: string, status: Database['public']['Enums']['approval_status'], adminNotes?: string): Promise<DbService> {
    return serviceService.updateApprovalStatus(id, status, adminNotes);
  }
  
  static async delete(id: string): Promise<boolean> {
    return serviceService.delete(id);
  }
  
  static async getByCategory(categoryId: string): Promise<DbService[]> {
    return serviceService.getByCategory(categoryId);
  }
  
  static async getActiveByCategory(categoryId: string): Promise<DbService[]> {
    return serviceService.getActiveByCategory(categoryId);
  }
  
  static async getPendingApproval(): Promise<DbService[]> {
    return serviceService.getPendingApproval();
  }

  static async getByIdWithRelations(id: string): Promise<{
    data: DbService & { 
      businesses?: Database['public']['Tables']['businesses']['Row'] | null; 
      service_categories?: Database['public']['Tables']['service_categories']['Row'] | null;
    } | null;
    error: Error | null;
  }> {
    return serviceService.getByIdWithRelations(id);
  }
} 