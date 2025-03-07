import { BaseServiceUtils } from '../BaseService';
import { businessCategoryService } from '../categories';
import { serviceCategoryService } from '../categories/service-category.service';
import { supabaseClientService } from '../core/supabase-client.service';

// Define the BusinessOnboardingStep interface
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

// Define the response type
interface BusinessOnboardingStepResponse<T> {
  data: T | null;
  error: string | null;
}


/**
 * Service to handle business onboarding workflow
 * This service provides methods for creating and managing business profiles
 * and handling the business onboarding flow
 */
export class BusinessOnboardingService extends BaseServiceUtils {
  private static instance: BusinessOnboardingService;

  constructor() {
    super();
  }

  public static getInstance(): BusinessOnboardingService {
    if (!BusinessOnboardingService.instance) {
      BusinessOnboardingService.instance = new BusinessOnboardingService();
    }
    return BusinessOnboardingService.instance;
  }

  /**
   * Fetch all available business categories
   * @returns List of business categories
   */
  async getBusinessCategories() {
    return businessCategoryService.getActiveBusinessCategories();
  }
  
  /**
   * Fetch service categories for a specific business category
   * @param businessCategoryId The ID of the business category
   * @returns List of service categories associated with the business category
   */
  async getServiceCategoriesByBusinessCategory(businessCategoryId: string) {
    return serviceCategoryService.getByBusinessCategory(businessCategoryId);
  }
  
  /**
   * Check if the current user has a business profile
   * @returns Boolean indicating if the user has a business profile
   */
  async hasBusinessProfile() {
    return supabaseClientService.executeWithRetry(async (client) => {
      // Get current session
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) {
        return false;
      }
      
      // Get user profile
      const { data: profile } = await client
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        return false;
      }
      
      // Check if user has a business
      const { data } = await client
        .from('businesses')
        .select('id')
        .eq('owner_id', profile.id)
        .maybeSingle();
        
      return !!data;
    });
  }
  
  /**
   * Get the onboarding status for the current user
   * @returns Object with onboarding status information
   */
  async getOnboardingStatus() {
    return supabaseClientService.executeWithRetry(async (client) => {
      // Get current session
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) {
        return { isBusinessUser: false, onboardingCompleted: false };
      }
      
      // Get user profile
      const { data: profile } = await client
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        return { isBusinessUser: false, onboardingCompleted: false };
      }

      return {
        isBusinessUser: profile.role === 'business',
        onboardingCompleted: !!profile.onboarding_completed
      };
    });
  }
  
  /**
   * Get business profile for the current user
   * @returns The user's business profile if it exists
   */
  async getBusinessProfile() {
    return supabaseClientService.executeWithRetry(async (client) => {
      // Get current session
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) {
        return null;
      }

      // Get user profile
      const { data: profile } = await client
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        return null;
      }

      // Get business profile
      const { data, error } = await client
        .from('businesses')
        .select(`
          *,
          business_category:business_categories(*)
        `)
        .eq('owner_id', profile.id)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    });
  }
  
  /**
   * Create a new business profile for the current user
   * @param businessData The business data to create
   * @returns The created business profile
   */
  async createBusinessProfile(businessData: any) {
    return supabaseClientService.executeWithRetry(async (client) => {
      // Get current session
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }
      
      // Get user profile
      const { data: profile } = await client
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }
      
      // Check if user already has a business
      const { data: existingBusiness } = await client
        .from('businesses')
        .select('id')
        .eq('owner_id', profile.id)
        .maybeSingle();
        
      if (existingBusiness) {
        throw new Error('User already has a business profile');
      }
      
      // Create business profile
      const { data, error } = await client
        .from('businesses')
        .insert({
          ...businessData,
          owner_id: profile.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating business profile: ${error.message}`);
      }
      
      // Update user profile to mark onboarding as completed
      await client
        .from('profiles')
        .update({
          onboarding_completed: true
        })
        .eq('id', profile.id);
        
      return data;
    });
  }
  
  /**
   * Update an existing business profile
   * @param businessId The ID of the business to update
   * @param businessData The business data to update
   * @returns The updated business profile
   */
  async updateBusinessProfile(
    businessId: string, 
    businessData: any
  ) {
    return supabaseClientService.executeWithRetry(async (client) => {
      // Get current session
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }
      
      // Get user profile
      const { data: profile } = await client
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }
      
      // Verify business ownership
      const { data: business } = await client
        .from('businesses')
        .select('id')
        .eq('id', businessId)
        .eq('owner_id', profile.id)
        .single();
        
      if (!business) {
        throw new Error('Business not found or not owned by user');
      }
      
      // Update business profile
      const { data, error } = await client
        .from('businesses')
        .update(businessData)
        .eq('id', businessId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating business profile: ${error.message}`);
      }

      return data;
    });
  }
  
  /**
   * Upload a file to Supabase storage
   * @param file The file to upload
   * @param bucket The storage bucket name
   * @param path The path within the bucket
   * @returns The public URL of the uploaded file
   */
  async uploadFile(file: File, bucket: string, path: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      const { data: urlData } = await client.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    });
  }
  
  /**
   * Get the onboarding steps for a business
   * @param businessId The business ID
   * @returns The onboarding steps
   */
  public async getOnboardingSteps(businessId: string): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep[]>> {
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

        return { data: data as unknown as BusinessOnboardingStep[], error: null };
      } catch (error) {
        return { data: null, error: String(error) };
      }
    });
  }
  
  /**
   * Get a specific onboarding step
   * @param businessId The business ID
   * @param stepNumber The step number
   * @returns The onboarding step
   */
  public async getOnboardingStep(businessId: string, stepNumber: number): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
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
          return { data: null, error: error.message };
        }

        return { data: data as unknown as BusinessOnboardingStep, error: null };
      } catch (error) {
        return { data: null, error: String(error) };
      }
    });
  }
  
  /**
   * Update an onboarding step
   * @param businessId The business ID
   * @param stepNumber The step number
   * @param updates The step updates
   * @returns The updated step
   */
  public async updateOnboardingStep(businessId: string, stepNumber: number, updates: Partial<BusinessOnboardingStep>): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
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
          return { data: null, error: error.message };
        }

        return { data: data as unknown as BusinessOnboardingStep, error: null };
      } catch (error) {
        return { data: null, error: String(error) };
      }
    });
  }
  
  /**
   * Complete an onboarding step
   * @param businessId The business ID
   * @param stepNumber The step number
   * @returns The updated step
   */
  public async completeOnboardingStep(businessId: string, stepNumber: number): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
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
          return { data: null, error: error.message };
        }

        return { data: data as unknown as BusinessOnboardingStep, error: null };
      } catch (error) {
        return { data: null, error: String(error) };
      }
    });
  }
}

// Static methods for backward compatibility
export function getOnboardingSteps(businessId: string) {
  return BusinessOnboardingService.getInstance().getOnboardingSteps(businessId);
}

export function getOnboardingStep(businessId: string, stepNumber: number) {
  return BusinessOnboardingService.getInstance().getOnboardingStep(businessId, stepNumber);
}

export function updateOnboardingStep(businessId: string, stepNumber: number, updates: Partial<BusinessOnboardingStep>) {
  return BusinessOnboardingService.getInstance().updateOnboardingStep(businessId, stepNumber, updates);
}

export function completeOnboardingStep(businessId: string, stepNumber: number) {
  return BusinessOnboardingService.getInstance().completeOnboardingStep(businessId, stepNumber);
}

// Export a singleton instance
export const businessOnboardingServiceNew = BusinessOnboardingService.getInstance();

// For backward compatibility
export function getOnboardingStatus() {
  return BusinessOnboardingService.getInstance().getOnboardingStatus();
} 