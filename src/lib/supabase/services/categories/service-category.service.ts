import { supabase } from '@/lib/supabase/client';
import { ServiceCategory } from '@/lib/supabase/types';
import { Database } from '@/types/database/generated.types';
import { BaseService } from '../BaseService';

type Tables = Database['public']['Tables'];
type ServiceCategoryTable = Tables['service_categories'];
type BusinessCategoryTable = Tables['business_categories'];

export class ServiceCategoryService extends BaseService<'service_categories'> {
    private static instance: ServiceCategoryService;

    protected constructor() {
        super(supabase, 'service_categories');
    }

    public static getInstance(): ServiceCategoryService {
        if (!ServiceCategoryService.instance) {
            ServiceCategoryService.instance = new ServiceCategoryService();
        }
        return ServiceCategoryService.instance;
    }

    override async getAll(): Promise<ServiceCategoryTable['Row'][]> {
        return super.getAll();
    }

    override async getById(id: string): Promise<ServiceCategoryTable['Row']> {
        return super.getById(id);
    }

    async getByBusinessCategory(businessCategoryId: string): Promise<ServiceCategoryTable['Row'][]> {
        try {
            const { data, error } = await this.client
                .from(this.table)
                .select('*')
                .eq('business_category_id', businessCategoryId)
                .eq('status', 'active')
                .order('name');

            if (error) throw error;
            return data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getWithBusinessCategory(
        id: string
    ): Promise<ServiceCategoryTable['Row'] & { business_category: BusinessCategoryTable['Row'] }> {
        try {
            const { data, error } = await this.client
                .from(this.table)
                .select(`*, business_category:business_categories(*)`)
                .eq('id', id)
                .single();

            if (error) throw error;
            return {
                ...data,
                business_category: data.business_category || {
                    created_at: null,
                    description: null,
                    icon: null,
                    id: '',
                    name: '',
                    status: null,
                    updated_at: null
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    override async create(category: ServiceCategoryTable['Insert']): Promise<ServiceCategoryTable['Row']> {
        return super.create(category);
    }

    override async update(
        id: string,
        updates: ServiceCategoryTable['Update']
    ): Promise<ServiceCategoryTable['Row']> {
        return super.update(id, updates);
    }

    override async delete(id: string): Promise<boolean> {
        return super.delete(id);
    }

    async getServiceCategoriesWithBusinessCategory(): Promise<ServiceCategory[]> {
        try {
            const { data, error } = await this.client
                .from(this.table)
                .select('*, business_category:business_categories(*)');

            if (error) throw error;
            return (data || []).map(item => ({
                ...item,
                business_category: item.business_category ? {
                    ...item.business_category,
                    created_at: item.business_category.created_at || null,
                    updated_at: item.business_category.updated_at || null
                } : null
            })) as ServiceCategory[];
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export const serviceCategoryService = ServiceCategoryService.getInstance();