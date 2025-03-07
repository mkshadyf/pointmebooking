import { BaseServiceUtils } from '../BaseService';
import { supabaseClientService } from '../core/supabase-client.service';

// Define AdminResponse type if it's not exported
interface AdminResponse<T> {
  data: T | null;
  error: any | null;
}

// Define Service type if it's not exported
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  business_id: string;
  category_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Additional admin related fields (optional)
  is_approved?: boolean;
  admin_notes?: string | null;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  approved_at?: string | null;
  approved_by_id?: string | null;
  rejection_reason?: string | null;
}

/**
 * Service for admin operations
 * Implements the singleton pattern for consistent instance management
 */
export class AdminService extends BaseServiceUtils {
  private static instance: AdminService;
  
  private constructor() {
    super();
  }
  
  /**
   * Get the singleton instance of AdminService
   */
  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }
  
  /**
   * Get pending services for approval
   * @returns The pending services
   */
  public async getPendingServices(): Promise<AdminResponse<Service[]>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('services')
        .select('*')
        .eq('approval_status', 'pending');

      if (error) {
        return { data: null, error };
      }

      // Add the is_active property to each service
      const servicesWithIsActive = data.map(service => ({
        ...service,
        is_active: service.status === 'active'
      }));

      return { data: servicesWithIsActive as Service[], error: null };
    });
  }
  
  /**
   * Approve a service
   * @param serviceId The service ID
   * @returns The approved service
   */
  public async approveService(serviceId: string): Promise<AdminResponse<Service>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      // Get the user ID first
      const { data: userData } = await client.auth.getUser();
      const userId = userData.user?.id;

      const { data, error } = await client
        .from('services')
        .update({ 
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by_id: userId 
        })
        .eq('id', serviceId)
        .select('*')
        .single();

      if (error) {
        return { data: null, error };
      }

      // Add the is_active property
      const serviceWithIsActive = {
        ...data,
        is_active: data.status === 'active'
      };

      return { data: serviceWithIsActive as Service, error: null };
    });
  }
  
  /**
   * Reject a service
   * @param serviceId The service ID
   * @param reason The reason for rejection
   * @returns The rejected service
   */
  public async rejectService(serviceId: string, reason: string): Promise<AdminResponse<Service>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('services')
        .update({
          approval_status: 'rejected',
          admin_notes: reason
        })
        .eq('id', serviceId)
        .select('*')
        .single();

      if (error) {
        return { data: null, error };
      }

      // Add the is_active property
      const serviceWithIsActive = {
        ...data,
        is_active: data.status === 'active'
      };

      return { data: serviceWithIsActive as Service, error: null };
    });
  }
  
  /**
   * Get all users
   * @returns All users
   */
  public async getAllUsers(): Promise<AdminResponse<any[]>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*');
        
        if (error) {
          return { data: null, error };
        }
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
  
  /**
   * Get user by ID
   * @param userId The user ID
   * @returns The user
   */
  public async getUserById(userId: string): Promise<AdminResponse<any>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          return { data: null, error };
        }
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
  
  /**
   * Update user role
   * @param userId The user ID
   * @param role The new role
   * @returns The updated user
   */
  public async updateUserRole(userId: string, role: string): Promise<AdminResponse<any>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('profiles')
          .update({ role: role as "customer" | "business" | "admin" })
          .eq('id', userId)
          .select()
          .single();
        
        if (error) {
          return { data: null, error };
        }
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
  
  /**
   * Suspend user
   * @param userId The user ID
   * @returns The suspended user
   */
  public async suspendUser(userId: string): Promise<AdminResponse<any>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('profiles')
          .update({ status: 'suspended' })
          .eq('id', userId)
          .select()
          .single();
        
        if (error) {
          return { data: null, error };
        }
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
  
  /**
   * Activate user
   * @param userId The user ID
   * @returns The activated user
   */
  public async activateUser(userId: string): Promise<AdminResponse<any>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('profiles')
          .update({ status: 'active' })
          .eq('id', userId)
          .select()
          .single();
        
        if (error) {
          return { data: null, error };
        }
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
}

// Export the singleton instance
export const adminService = AdminService.getInstance();

// Static wrapper for backward compatibility
export class AdminServiceStatic {
  public static async getPendingServices(): Promise<AdminResponse<Service[]>> {
    return adminService.getPendingServices();
  }
  
  public static async approveService(serviceId: string): Promise<AdminResponse<Service>> {
    return adminService.approveService(serviceId);
  }
  
  public static async rejectService(serviceId: string, reason: string): Promise<AdminResponse<Service>> {
    return adminService.rejectService(serviceId, reason);
  }
  
  public static async getAllUsers(): Promise<AdminResponse<any[]>> {
    return adminService.getAllUsers();
  }
  
  public static async getUserById(userId: string): Promise<AdminResponse<any>> {
    return adminService.getUserById(userId);
  }
  
  public static async updateUserRole(userId: string, role: string): Promise<AdminResponse<any>> {
    return adminService.updateUserRole(userId, role);
  }
  
  public static async suspendUser(userId: string): Promise<AdminResponse<any>> {
    return adminService.suspendUser(userId);
  }
  
  public static async activateUser(userId: string): Promise<AdminResponse<any>> {
    return adminService.activateUser(userId);
  }
} 