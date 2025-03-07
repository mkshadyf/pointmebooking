import { BaseServiceUtils } from '../BaseService';
import { supabaseClientService } from '../core/supabase-client.service';

// Define business onboarding step interface locally to avoid conflicts
export interface BusinessOnboardingStep {
  id: string;
  business_id: string;
  step_number: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  is_required: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// Define response interface locally to avoid conflicts
export interface BusinessOnboardingStepResponse<T> {
  data: T | null;
  error: string | null;
}


/**
 * Business Onboarding Service
 * Handles business onboarding steps and progress tracking
 */
export class BusinessOnboardingService extends BaseServiceUtils {
  private static instance: BusinessOnboardingService;
  
  private constructor() {
    super();
  }
  
  /**
   * Get the singleton instance of BusinessOnboardingService
   */
  public static getInstance(): BusinessOnboardingService {
    if (!BusinessOnboardingService.instance) {
      BusinessOnboardingService.instance = new BusinessOnboardingService();
    }
    return BusinessOnboardingService.instance;
  }
  
  // Use the extended database type with supabaseClientService
  async getOnboardingSteps(businessId: string): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep[]>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use type assertion for client to access the business_onboarding_steps table
        const extendedClient = client as any;
        
        const { data, error } = await extendedClient
          .from('business_onboarding_steps')
          .select('*')
          .eq('business_id', businessId)
          .order('step_number', { ascending: true });
        
        if (error) {
          console.error('Error getting onboarding steps:', error);
          return { data: null, error: error.message };
        }
        
        return { data: data as unknown as BusinessOnboardingStep[], error: null };
      } catch (error) {
        console.error('Error in getOnboardingSteps:', error);
        return { data: null, error: String(error) };
      }
    });
  }
  
  /**
   * Get a specific onboarding step for a business
   * @param businessId The business ID
   * @param stepNumber The step number
   */
  async getOnboardingStep(businessId: string, stepNumber: number): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use type assertion for client to access the business_onboarding_steps table
        const extendedClient = client as any;
        
        const { data, error } = await extendedClient
          .from('business_onboarding_steps')
          .select('*')
          .eq('business_id', businessId)
          .eq('step_number', stepNumber)
          .single();
        
        if (error) {
          console.error('Error getting onboarding step:', error);
          return { data: null, error: error.message };
        }
        
        return { data: data as BusinessOnboardingStep, error: null };
      } catch (error) {
        console.error('Error in getOnboardingStep:', error);
        return { data: null, error: String(error) };
      }
    });
  }
  
  /**
   * Update a specific onboarding step for a business
   * @param businessId The business ID
   * @param stepNumber The step number
   * @param updates The updates to apply
   */
  async updateOnboardingStep(
    businessId: string, 
    stepNumber: number, 
    updates: Partial<BusinessOnboardingStep>
  ): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use type assertion for client to access the business_onboarding_steps table
        const extendedClient = client as any;
        
        const { data, error } = await extendedClient
          .from('business_onboarding_steps')
          .update(updates)
          .eq('business_id', businessId)
          .eq('step_number', stepNumber)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating onboarding step:', error);
          return { data: null, error: error.message };
        }
        
        return { data: data as BusinessOnboardingStep, error: null };
      } catch (error) {
        console.error('Error in updateOnboardingStep:', error);
        return { data: null, error: String(error) };
      }
    });
  }
  
  /**
   * Complete a specific onboarding step for a business
   * @param businessId The business ID
   * @param stepNumber The step number
   */
  async completeOnboardingStep(businessId: string, stepNumber: number): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use type assertion for client to access the business_onboarding_steps table
        const extendedClient = client as any;
        
        const { data, error } = await extendedClient
          .from('business_onboarding_steps')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('business_id', businessId)
          .eq('step_number', stepNumber)
          .select()
          .single();
        
        if (error) {
          console.error('Error completing onboarding step:', error);
          return { data: null, error: error.message };
        }
        
        return { data: data as unknown as BusinessOnboardingStep, error: null };
      } catch (error) {
        console.error('Error in completeOnboardingStep:', error);
        return { data: null, error: String(error) };
      }
    });
  }
  
  /**
   * Get the current onboarding status for a business
   * @param businessId The business ID
   */
  async getOnboardingStatus(businessId: string): Promise<BusinessOnboardingStepResponse<{
    totalSteps: number;
    completedSteps: number;
    currentStep: number;
    progress: number;
  }>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use type assertion for client to access the business_onboarding_steps table
        const extendedClient = client as any;
        
        const { data, error } = await extendedClient
          .from('business_onboarding_steps')
          .select('*')
          .eq('business_id', businessId)
          .order('step_number', { ascending: true });
        
        if (error) {
          return { data: null, error: error.message };
        }
        
        // Calculate onboarding progress
        const totalSteps = data.length;
        const completedSteps = data.filter((step: any) => step.status === 'completed').length;
        const currentStep = completedSteps < totalSteps ? completedSteps + 1 : totalSteps;
        const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        
        return {
          data: {
            totalSteps,
            completedSteps,
            currentStep,
            progress
          },
          error: null
        };
      } catch (error) {
        console.error('Error getting onboarding status:', error);
        return { data: null, error: String(error) };
      }
    });
  }
  
  /**
   * Get business categories
   */
  async getBusinessCategories(): Promise<BusinessOnboardingStepResponse<any[]>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('business_categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Error getting business categories:', error);
          return { data: null, error: error.message };
        }
        
        return { data, error: null };
      } catch (error) {
        console.error('Error in getBusinessCategories:', error);
        return { data: null, error: 'Failed to get business categories' };
      }
    });
  }
  
  /**
   * Get service categories by business category
   * @param businessCategoryId The business category ID
   */
  async getServiceCategoriesByBusinessCategory(businessCategoryId: string): Promise<BusinessOnboardingStepResponse<any[]>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        const { data, error } = await client
          .from('service_categories')
          .select('*')
          .eq('business_category_id', businessCategoryId)
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Error getting service categories:', error);
          return { data: null, error: error.message };
        }
        
        return { data, error: null };
      } catch (error) {
        console.error('Error in getServiceCategoriesByBusinessCategory:', error);
        return { data: null, error: 'Failed to get service categories' };
      }
    });
  }
}

// Export the singleton instance
export const businessOnboardingService = BusinessOnboardingService.getInstance();

// Static wrapper for backward compatibility
export class BusinessOnboardingServiceStatic {
  static async getOnboardingSteps(businessId: string): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep[]>> {
    return businessOnboardingService.getOnboardingSteps(businessId);
  }
  
  static async getOnboardingStep(businessId: string, stepNumber: number): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
    return businessOnboardingService.getOnboardingStep(businessId, stepNumber);
  }
  
  static async updateOnboardingStep(
    businessId: string, 
    stepNumber: number, 
    updates: Partial<BusinessOnboardingStep>
  ): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
    return businessOnboardingService.updateOnboardingStep(businessId, stepNumber, updates);
  }
  
  static async completeOnboardingStep(businessId: string, stepNumber: number): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
    return businessOnboardingService.completeOnboardingStep(businessId, stepNumber);
  }
  
  static async getOnboardingStatus(businessId: string): Promise<BusinessOnboardingStepResponse<{
    totalSteps: number;
    completedSteps: number;
    currentStep: number;
    progress: number;
  }>> {
    return businessOnboardingService.getOnboardingStatus(businessId);
  }
  
  static async getBusinessCategories(): Promise<BusinessOnboardingStepResponse<any[]>> {
    return businessOnboardingService.getBusinessCategories();
  }
  
  static async getServiceCategoriesByBusinessCategory(businessCategoryId: string): Promise<BusinessOnboardingStepResponse<any[]>> {
    return businessOnboardingService.getServiceCategoriesByBusinessCategory(businessCategoryId);
  }
} 