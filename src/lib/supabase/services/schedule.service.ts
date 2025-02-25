import { Schedule } from '@/types';
import { Database } from '@generated.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';

type DbScheduleInsert = Database['public']['Tables']['schedules']['Insert'];

export class ScheduleService extends BaseService<'schedules'> {
    constructor(client: SupabaseClient<Database>) {
        super(client, 'schedules');
    }

    async getStaffSchedule(staffId: string): Promise<Schedule[]> {
        try {
            const { data, error } = await this.client
                .from(this.table)
                .select(`
                    *,
                    staff:staff_id (
                        id,
                        role,
                        user:user_id (
                            full_name,
                            email
                        )
                    ),
                    business:business_id (
                        id,
                        name
                    )
                `)
                .eq('staff_id', staffId)
                .order('day_of_week', { ascending: true });

            if (error) throw error;
            return data as unknown as Schedule[];
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getBusinessSchedules(businessId: string): Promise<Schedule[]> {
        try {
            const { data, error } = await this.client
                .from(this.table)
                .select(`
                    *,
                    staff:staff_id (
                        id,
                        role,
                        user:user_id (
                            full_name,
                            email
                        )
                    ),
                    business:business_id (
                        id,
                        name
                    )
                `)
                .eq('business_id', businessId)
                .order('staff_id')
                .order('day_of_week', { ascending: true });

            if (error) throw error;
            return data as unknown as Schedule[];
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateStaffSchedule(staffId: string, schedules: Partial<DbScheduleInsert>[]): Promise<Schedule[]> {
        try {
            const schedulesToUpsert: DbScheduleInsert[] = schedules.map(schedule => ({
                business_id: schedule.business_id!,
                staff_id: staffId,
                day_of_week: schedule.day_of_week!,
                start_time: schedule.start_time!,
                end_time: schedule.end_time!,
                is_available: schedule.is_available ?? true,
                id: schedule.id,
                created_at: schedule.created_at,
                updated_at: schedule.updated_at
            }));

            const { data, error } = await this.client
                .from(this.table)
                .upsert(schedulesToUpsert)
                .select(`
                    *,
                    staff:staff_id (
                        id,
                        role,
                        user:user_id (
                            full_name,
                            email
                        )
                    ),
                    business:business_id (
                        id,
                        name
                    )
                `);

            if (error) throw error;
            return data as unknown as Schedule[];
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getAvailableSlots(businessId: string, date: string): Promise<Schedule[]> {
        try {
            const dayOfWeek = new Date(date).getDay();
            const { data, error } = await this.client
                .from(this.table)
                .select(`
                    *,
                    staff:staff_id (
                        id,
                        role,
                        user:user_id (
                            full_name,
                            email
                        )
                    )
                `)
                .eq('business_id', businessId)
                .eq('day_of_week', dayOfWeek)
                .eq('is_available', true);

            if (error) throw error;
            return data as unknown as Schedule[];
        } catch (error) {
            return this.handleError(error);
        }
    }
} 