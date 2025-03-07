import { Database } from '@/types/database/generated.types';
import { supabase } from '../client/browser';
import { BaseServiceUtils } from './BaseService';

type Tables = Database['public']['Tables'];
type BusinessCategoryTable = Tables['business_categories'];
type ServiceCategoryTable = Tables['service_categories'];
type ServiceTable = Tables['services'];

/**
 * Service to handle admin-specific operations
 * This service provides methods for managing business categories, service categories,
 * approving services, and other admin tasks
 * Follows the singleton pattern for consistent instance usage
 */
export class AdminService extends BaseServiceUtils {
  private static instance: AdminService;

  private constructor() {
    super();
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Check if the current user is an admin
   * @returns Boolean indicating if the user is an admin
   */
  async isAdmin(): Promise<boolean> {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return false;
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
      
    return profile?.role === 'admin';
  }
  
  /**
   * Create a new business category
   * @param category The business category data to create
   * @returns The created business category
   */
  async createBusinessCategory(category: BusinessCategoryTable['Insert']): Promise<BusinessCategoryTable['Row']> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { data, error } = await supabase
      .from('business_categories')
      .insert(category)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error creating business category: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Update an existing business category
   * @param id The ID of the business category to update
   * @param category The business category data to update
   * @returns The updated business category
   */
  async updateBusinessCategory(id: string, category: BusinessCategoryTable['Update']): Promise<BusinessCategoryTable['Row']> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { data, error } = await supabase
      .from('business_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error updating business category: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Delete a business category
   * @param id The ID of the business category to delete
   * @returns Boolean indicating success
   */
  async deleteBusinessCategory(id: string): Promise<boolean> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Check if category is in use by any businesses
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id')
      .eq('business_category', id)
      .limit(1);
      
    if (businesses && businesses.length > 0) {
      throw new Error('Cannot delete category: It is being used by one or more businesses');
    }
    
    // Check if category is in use by any service categories
    const { data: serviceCategories } = await supabase
      .from('service_categories')
      .select('id')
      .eq('business_category_id', id)
      .limit(1);
      
    if (serviceCategories && serviceCategories.length > 0) {
      throw new Error('Cannot delete category: It is being used by one or more service categories');
    }
    
    const { error } = await supabase
      .from('business_categories')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw new Error(`Error deleting business category: ${error.message}`);
    }
    
    return true;
  }
  
  /**
   * Create a new service category
   * @param category The service category data to create
   * @returns The created service category
   */
  async createServiceCategory(category: ServiceCategoryTable['Insert']): Promise<ServiceCategoryTable['Row']> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { data, error } = await supabase
      .from('service_categories')
      .insert(category)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error creating service category: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Update an existing service category
   * @param id The ID of the service category to update
   * @param category The service category data to update
   * @returns The updated service category
   */
  async updateServiceCategory(id: string, category: ServiceCategoryTable['Update']): Promise<ServiceCategoryTable['Row']> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { data, error } = await supabase
      .from('service_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error updating service category: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Delete a service category
   * @param id The ID of the service category to delete
   * @returns Boolean indicating success
   */
  async deleteServiceCategory(id: string): Promise<boolean> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Check if category is in use by any services
    const { data: services } = await supabase
      .from('services')
      .select('id')
      .eq('category_id', id)
      .limit(1);
      
    if (services && services.length > 0) {
      throw new Error('Cannot delete category: It is being used by one or more services');
    }
    
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw new Error(`Error deleting service category: ${error.message}`);
    }
    
    return true;
  }
  
  /**
   * Get all businesses with pagination
   * @param page The page number (1-indexed)
   * @param limit The number of items per page
   * @returns Paginated list of businesses
   */
  async getBusinesses(page = 1, limit = 10): Promise<{ data: any[], pagination: any }> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const offset = (page - 1) * limit;
    
    // Get total count
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
      
    // Get paginated data
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        business_category:business_categories(*)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Error fetching businesses: ${error.message}`);
    }
    
    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    };
  }
  
  /**
   * Get all services pending approval
   * @returns List of services pending approval
   */
  async getPendingServices(): Promise<ServiceTable['Row'][]> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        business:businesses(*),
        category:service_categories(*)
      `)
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Error fetching pending services: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Approve or reject a service
   * @param id The ID of the service to approve/reject
   * @param status The approval status (approved/rejected)
   * @param adminNotes Optional notes from the admin
   * @returns The updated service
   */
  async updateServiceApproval(
    id: string, 
    status: Database['public']['Enums']['approval_status'],
    adminNotes?: string
  ): Promise<ServiceTable['Row']> {
    // Verify admin status
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Get current session for admin ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    // Get admin profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
      
    if (!profile) {
      throw new Error('Admin profile not found');
    }
    
    const updates: ServiceTable['Update'] = {
      approval_status: status,
      admin_notes: adminNotes,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      approved_by_id: status === 'approved' ? profile.id : null
    };
    
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error updating service approval: ${error.message}`);
    }
    
    return data;
  }
}

// Create a singleton instance
export const adminService = AdminService.getInstance();

// Static wrapper for backward compatibility
export class AdminServiceStatic {
  static async isAdmin(): Promise<boolean> {
    return adminService.isAdmin();
  }
  
  static async createBusinessCategory(category: BusinessCategoryTable['Insert']): Promise<BusinessCategoryTable['Row']> {
    return adminService.createBusinessCategory(category);
  }
  
  static async updateBusinessCategory(id: string, category: BusinessCategoryTable['Update']): Promise<BusinessCategoryTable['Row']> {
    return adminService.updateBusinessCategory(id, category);
  }
  
  static async deleteBusinessCategory(id: string): Promise<boolean> {
    return adminService.deleteBusinessCategory(id);
  }
  
  static async createServiceCategory(category: ServiceCategoryTable['Insert']): Promise<ServiceCategoryTable['Row']> {
    return adminService.createServiceCategory(category);
  }
  
  static async updateServiceCategory(id: string, category: ServiceCategoryTable['Update']): Promise<ServiceCategoryTable['Row']> {
    return adminService.updateServiceCategory(id, category);
  }
  
  static async deleteServiceCategory(id: string): Promise<boolean> {
    return adminService.deleteServiceCategory(id);
  }
  
  static async getBusinesses(page = 1, limit = 10): Promise<{ data: any[], pagination: any }> {
    return adminService.getBusinesses(page, limit);
  }
  
  static async getPendingServices(): Promise<ServiceTable['Row'][]> {
    return adminService.getPendingServices();
  }
  
  static async updateServiceApproval(
    id: string, 
    status: Database['public']['Enums']['approval_status'],
    adminNotes?: string
  ): Promise<ServiceTable['Row']> {
    return adminService.updateServiceApproval(id, status, adminNotes);
  }
} 