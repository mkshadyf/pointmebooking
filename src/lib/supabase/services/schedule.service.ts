import { Database } from '@/types/database/generated.types';
import { BaseServiceUtils } from './BaseService';
import { supabaseClientService } from './core/supabase-client.service';

// Define types from database schema
type DbSchedule = Database['public']['Tables']['schedules']['Row'];
type ScheduleInsert = Database['public']['Tables']['schedules']['Insert'];
type ScheduleUpdate = Database['public']['Tables']['schedules']['Update'];

// Define Schedule type locally since it's not exported from @/types
interface Schedule {
    id: string;
    business_id: string;
    staff_id: string | null;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Service for managing schedules
 * Follows the singleton pattern for consistent instance usage
 */
export class ScheduleService extends BaseServiceUtils {
    private static instance: ScheduleService;

    private constructor() {
        super();
    }

    public static getInstance(): ScheduleService {
        if (!ScheduleService.instance) {
            ScheduleService.instance = new ScheduleService();
        }
        return ScheduleService.instance;
    }

    async getByBusiness(businessId: string): Promise<DbSchedule[]> {
        return supabaseClientService.executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('schedules')
                .select('*')
                .eq('business_id', businessId);

            if (error) {
                throw new Error(`Error fetching schedules: ${error.message}`);
            }

            return data || [];
        });
    }

    async getById(id: string): Promise<DbSchedule> {
        return supabaseClientService.executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('schedules')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                throw new Error(`Error fetching schedule: ${error.message}`);
            }

            return data;
        });
    }

    async create(schedule: ScheduleInsert): Promise<DbSchedule> {
        return supabaseClientService.executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('schedules')
                .insert(schedule)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating schedule: ${error.message}`);
            }

            return data;
        });
    }

    async update(id: string, updates: ScheduleUpdate): Promise<DbSchedule> {
        return supabaseClientService.executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('schedules')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating schedule: ${error.message}`);
            }

            return data;
        });
    }

    async delete(id: string): Promise<boolean> {
        return supabaseClientService.executeWithRetry(async (client) => {
            const { error } = await client
                .from('schedules')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error deleting schedule: ${error.message}`);
            }

            return true;
        });
    }

    // Helper method to handle errors
    private handleError(error: any): never {
        console.error('Schedule service error:', error);
        throw new Error(error?.message || 'An error occurred in the schedule service');
    }

    async getStaffSchedule(staffId: string): Promise<Schedule[]> {
        try {
            return await supabaseClientService.executeWithRetry(async (client) => {
                const { data, error } = await client
                    .from('schedules')
                    .select(`
                        id,
                        business_id,
                        staff_id,
                        day_of_week,
                        start_time,
                        end_time,
                        is_available,
                        created_at,
                        updated_at
                    `)
                    .eq('staff_id', staffId);

                if (error) {
                    throw new Error(`Error fetching staff schedule: ${error.message}`);
                }

                return data as Schedule[];
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getBusinessSchedules(businessId: string): Promise<Schedule[]> {
        try {
            return await supabaseClientService.executeWithRetry(async (client) => {
                const { data, error } = await client
                    .from('schedules')
                    .select(`
                        id,
                        business_id,
                        staff_id,
                        day_of_week,
                        start_time,
                        end_time,
                        is_available,
                        created_at,
                        updated_at
                    `)
                    .eq('business_id', businessId);

                if (error) {
                    throw new Error(`Error fetching business schedules: ${error.message}`);
                }

                return data as Schedule[];
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateStaffSchedule(staffId: string, schedules: Partial<ScheduleInsert>[]): Promise<Schedule[]> {
        try {
            // Ensure all required fields are present for each schedule
            const schedulesToUpsert = schedules.map(schedule => {
                if (!schedule.business_id) {
                    throw new Error('business_id is required for schedule');
                }
                if (schedule.day_of_week === undefined) {
                    throw new Error('day_of_week is required for schedule');
                }
                if (!schedule.start_time) {
                    throw new Error('start_time is required for schedule');
                }
                if (!schedule.end_time) {
                    throw new Error('end_time is required for schedule');
                }
                
                return {
                    business_id: schedule.business_id,
                    staff_id: staffId,
                    day_of_week: schedule.day_of_week,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    is_available: schedule.is_available ?? true,
                    id: schedule.id,
                    created_at: schedule.created_at,
                    updated_at: new Date().toISOString()
                };
            });

            return await supabaseClientService.executeWithRetry(async (client) => {
                const { data, error } = await client
                    .from('schedules')
                    .upsert(schedulesToUpsert)
                    .select();

                if (error) {
                    throw new Error(`Error updating staff schedule: ${error.message}`);
                }

                return data as Schedule[];
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getAvailableSlots(businessId: string, date: string): Promise<Schedule[]> {
        try {
            const dayOfWeek = new Date(date).getDay();
            return await supabaseClientService.executeWithRetry(async (client) => {
                const { data, error } = await client
                    .from('schedules')
                    .select(`
                        id,
                        business_id,
                        staff_id,
                        day_of_week,
                        start_time,
                        end_time,
                        is_available,
                        created_at,
                        updated_at
                    `)
                    .eq('business_id', businessId)
                    .eq('day_of_week', dayOfWeek)
                    .eq('is_available', true);

                if (error) {
                    throw new Error(`Error fetching available slots: ${error.message}`);
                }

                return data as Schedule[];
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export const scheduleService = ScheduleService.getInstance();

// Static wrapper for backward compatibility
export class ScheduleServiceStatic {
    static async getStaffSchedule(staffId: string): Promise<Schedule[]> {
        return scheduleService.getStaffSchedule(staffId);
    }
    
    static async getBusinessSchedules(businessId: string): Promise<Schedule[]> {
        return scheduleService.getBusinessSchedules(businessId);
    }
    
    static async updateStaffSchedule(staffId: string, schedules: Partial<ScheduleInsert>[]): Promise<Schedule[]> {
        return scheduleService.updateStaffSchedule(staffId, schedules);
    }
    
    static async getAvailableSlots(businessId: string, date: string): Promise<Schedule[]> {
        return scheduleService.getAvailableSlots(businessId, date);
    }
} 