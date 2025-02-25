import { supabase } from '@/lib/supabase/client';
import { ServiceCategory } from '@/lib/supabase/types';
import { Database } from '@generated.types';
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
            
            // Create a default business category if the relationship is not found
            const defaultBusinessCategory: BusinessCategoryTable['Row'] = {
                id: '',
                name: '',
                description: null,
                created_at: '',
                updated_at: '',
                icon: null
            };
            
            // Check if business_category exists and is a valid object
            const businessCategory = data.business_category && 
                typeof data.business_category === 'object' && 
                !('error' in data.business_category)
                ? data.business_category 
                : defaultBusinessCategory;
                
            return {
                ...data,
                business_category: businessCategory
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
            
            // Create a default business category
            const defaultBusinessCategory: BusinessCategoryTable['Row'] = {
                id: '',
                name: '',
                description: null,
                created_at: '',
                updated_at: '',
                icon: null
            };
            
            return (data || []).map(item => {
                // Check if business_category exists and is a valid object
                const businessCategory = item.business_category && 
                    typeof item.business_category === 'object' && 
                    !('error' in item.business_category)
                    ? item.business_category 
                    : defaultBusinessCategory;
                    
                return {
                    ...item,
                    business_category: businessCategory
                };
            }) as ServiceCategory[];
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export const serviceCategoryService = ServiceCategoryService.getInstance();