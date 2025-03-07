import { Database } from '@/types/database/generated.types';
import { BaseServiceUtils } from '../BaseService';
import { supabaseClientService } from '../core/supabase-client.service';

// Define Schedule type if it's not exported from types
interface Schedule {
  id: string;
  business_id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Define ScheduleResponse type if it's not exported
interface ScheduleResponse<T> {
  data: T | null;
  error: any | null;
}

type DbScheduleInsert = Database['public']['Tables']['schedules']['Insert'];

/**
 * Service for managing business schedules and availability
 * Implements the singleton pattern for consistent instance management
 */
export class ScheduleService extends BaseServiceUtils {
  private static instance: ScheduleService;
  
  private constructor() {
    super();
  }
  
  /**
   * Get the singleton instance of ScheduleService
   */
  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }
  
  /**
   * Get all schedules for a business
   * @param businessId The business ID
   * @returns The schedules
   */
  public async getSchedulesByBusinessId(businessId: string): Promise<ScheduleResponse<Schedule[]>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('schedules')
          .select('*')
          .eq('business_id', businessId);
        
        if (error) {
          return { data: null, error };
        }
        
        return { data: data as Schedule[], error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
  
  /**
   * Get a schedule by ID
   * @param scheduleId The schedule ID
   * @returns The schedule
   */
  public async getScheduleById(scheduleId: string): Promise<ScheduleResponse<Schedule>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('schedules')
          .select('*')
          .eq('id', scheduleId)
          .single();
        
        if (error) {
          return { data: null, error };
        }
        
        return { data: data as Schedule, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
  
  /**
   * Create a new schedule
   * @param schedule The schedule to create
   * @returns The created schedule
   */
  public async createSchedule(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduleResponse<Schedule>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('schedules')
          .insert([schedule as any])
          .select()
          .single();
        
        if (error) {
          return { data: null, error };
        }
        
        return { data: data as Schedule, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
  
  /**
   * Update a schedule
   * @param scheduleId The schedule ID
   * @param schedule The schedule updates
   * @returns The updated schedule
   */
  public async updateSchedule(scheduleId: string, schedule: Partial<Schedule>): Promise<ScheduleResponse<Schedule>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('schedules')
          .update(schedule)
          .eq('id', scheduleId)
          .select()
          .single();
        
        if (error) {
          return { data: null, error };
        }
        
        return { data: data as Schedule, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
  
  /**
   * Delete a schedule
   * @param scheduleId The schedule ID
   * @returns Success or error
   */
  public async deleteSchedule(scheduleId: string): Promise<ScheduleResponse<void>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { error } = await client
          .from('schedules')
          .delete()
          .eq('id', scheduleId);
        
        if (error) {
          return { data: undefined, error };
        }
        
        return { data: undefined, error: null };
      } catch (error) {
        return { data: undefined, error };
      }
    });
  }
  
  /**
   * Get staff schedule
   * @param staffId The staff ID
   * @returns The staff schedule
   */
  public async getStaffSchedule(staffId: string): Promise<Schedule[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('schedules')
          .select('*')
          .eq('staff_id', staffId);
        
        if (error) {
          throw error;
        }
        
        return data as Schedule[];
      } catch (error) {
        console.error('Error getting staff schedule:', error);
        return [];
      }
    });
  }
  
  /**
   * Get business schedules
   * @param businessId The business ID
   * @returns The business schedules
   */
  public async getBusinessSchedules(businessId: string): Promise<Schedule[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('schedules')
          .select('*')
          .eq('business_id', businessId);
        
        if (error) {
          throw error;
        }
        
        return data as Schedule[];
      } catch (error) {
        console.error('Error getting business schedules:', error);
        return [];
      }
    });
  }
  
  /**
   * Update staff schedule
   * @param staffId The staff ID
   * @param schedules The schedule updates
   * @returns The updated schedules
   */
  public async updateStaffSchedule(staffId: string, schedules: Partial<DbScheduleInsert>[]): Promise<Schedule[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Ensure all required fields are present
        const schedulesToUpsert = schedules.map(schedule => ({
          business_id: schedule.business_id || '',
          staff_id: staffId,
          day_of_week: schedule.day_of_week || 0,
          start_time: schedule.start_time || '',
          end_time: schedule.end_time || '',
          is_available: schedule.is_available ?? true,
          id: schedule.id,
          created_at: schedule.created_at,
          updated_at: schedule.updated_at
        }));
        
        const { data, error } = await client
          .from('schedules')
          .upsert(schedulesToUpsert)
          .select();
        
        if (error) {
          throw error;
        }
        
        return data as Schedule[];
      } catch (error) {
        console.error('Error updating staff schedule:', error);
        return [];
      }
    });
  }
  
  /**
   * Get available slots
   * @param businessId The business ID
   * @param date The date
   * @returns The available slots
   */
  public async getAvailableSlots(businessId: string, date: string): Promise<Schedule[]> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const dayOfWeek = new Date(date).getDay();
        
        const { data, error } = await client
          .from('schedules')
          .select('*')
          .eq('business_id', businessId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_available', true);
        
        if (error) {
          throw error;
        }
        
        return data as Schedule[];
      } catch (error) {
        console.error('Error getting available slots:', error);
        return [];
      }
    });
  }
}

// Export the singleton instance
export const scheduleService = ScheduleService.getInstance();

// Static wrapper for backward compatibility
export class ScheduleServiceStatic {
  public static async getStaffSchedule(staffId: string): Promise<Schedule[]> {
    return scheduleService.getStaffSchedule(staffId);
  }
  
  public static async getBusinessSchedules(businessId: string): Promise<Schedule[]> {
    return scheduleService.getBusinessSchedules(businessId);
  }
  
  public static async updateStaffSchedule(staffId: string, schedules: Partial<DbScheduleInsert>[]): Promise<Schedule[]> {
    return scheduleService.updateStaffSchedule(staffId, schedules);
  }
  
  public static async getAvailableSlots(businessId: string, date: string): Promise<Schedule[]> {
    return scheduleService.getAvailableSlots(businessId, date);
  }
  
  public static async getSchedulesByBusinessId(businessId: string): Promise<ScheduleResponse<Schedule[]>> {
    return scheduleService.getSchedulesByBusinessId(businessId);
  }
  
  public static async getScheduleById(scheduleId: string): Promise<ScheduleResponse<Schedule>> {
    return scheduleService.getScheduleById(scheduleId);
  }
  
  public static async createSchedule(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduleResponse<Schedule>> {
    return scheduleService.createSchedule(schedule);
  }
  
  public static async updateSchedule(scheduleId: string, schedule: Partial<Schedule>): Promise<ScheduleResponse<Schedule>> {
    return scheduleService.updateSchedule(scheduleId, schedule);
  }
  
  public static async deleteSchedule(scheduleId: string): Promise<ScheduleResponse<void>> {
    return scheduleService.deleteSchedule(scheduleId);
  }
} 