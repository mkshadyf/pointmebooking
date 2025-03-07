import { supabaseClientService } from '../core/supabase-client.service';
import { BusinessOnboardingStepResponse } from './business-onboarding-service';


/**
 * Business onboarding step database model
 */
interface BusinessOnboardingStep {
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

/**
 * Service for managing business onboarding steps
 */
class BusinessOnboardingService {
  private static instance: BusinessOnboardingService;
  private constructor() {}

  /**
   * Get the singleton instance of the BusinessOnboardingService
   */
  public static getInstance(): BusinessOnboardingService {
    if (!BusinessOnboardingService.instance) {
      BusinessOnboardingService.instance = new BusinessOnboardingService();
    }
    return BusinessOnboardingService.instance;
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Get business by user ID
   */
  async getBusinessByUserId(userId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (error) {
        console.error('Error fetching business:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Get profile by ID
   */
  async getProfileById(profileId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Update profile
   */
  async updateProfile(profileId: string, updates: any) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Update business
   */
  async updateBusiness(businessId: string, updates: any) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('businesses')
        .update(updates)
        .eq('id', businessId)
        .select()
        .single();

      if (error) {
        console.error('Error updating business:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Get business by ID
   */
  async getBusinessById(businessId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) {
        console.error('Error fetching business:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Create business
   */
  async createBusiness(businessData: any) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) {
        console.error('Error creating business:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Update business status
   */
  async updateBusinessStatus(businessId: string, status: "active" | "inactive" | "suspended") {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('businesses')
        .update({ status })
        .eq('id', businessId)
        .select()
        .single();

      if (error) {
        console.error('Error updating business status:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(profileId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Error completing onboarding:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus(profileId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching onboarding status:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Update business logo
   */
  async updateBusinessLogo(businessId: string, logoUrl: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('businesses')
        .update({ logo_url: logoUrl })
        .eq('id', businessId)
        .select()
        .single();

      if (error) {
        console.error('Error updating business logo:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Upload business logo
   */
  async uploadBusinessLogo(file: File, businessId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const bucket = 'business-logos';
      const filePath = `${businessId}/${Date.now()}-${file.name}`;

      const uploadResult = await client.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadResult.error) {
        console.error('Error uploading logo:', uploadResult.error);
        return { data: null, error: uploadResult.error.message };
      }

      const { data: urlData } = await client.storage
        .from(bucket)
        .getPublicUrl(uploadResult.data.path);

      return { data: urlData.publicUrl, error: null };
    });
  }

  /**
   * Get all onboarding steps for a business
   */
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
          console.error('Error fetching onboarding steps:', error);
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
          console.error('Error fetching onboarding step:', error);
          return { data: null, error: error.message };
        }

        return { data: data as unknown as BusinessOnboardingStep, error: null };
      } catch (error) {
        console.error('Error in getOnboardingStep:', error);
        return { data: null, error: String(error) };
      }
    });
  }

  /**
   * Update an onboarding step
   */
  async updateOnboardingStep(businessId: string, stepNumber: number, updates: Partial<BusinessOnboardingStep>): Promise<BusinessOnboardingStepResponse<BusinessOnboardingStep>> {
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

        return { data: data as unknown as BusinessOnboardingStep, error: null };
      } catch (error) {
        console.error('Error in updateOnboardingStep:', error);
        return { data: null, error: String(error) };
      }
    });
  }

  /**
   * Complete an onboarding step
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
            completed_at: new Date().toISOString(),
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
   * Delete an onboarding step
   */
  async deleteOnboardingStep(stepId: string): Promise<BusinessOnboardingStepResponse<void>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use type assertion for client to access the business_onboarding_steps table
        const extendedClient = client as any;
        
        const { error } = await extendedClient
          .from('business_onboarding_steps')
          .delete()
          .eq('id', stepId);

        if (error) {
          console.error('Error deleting onboarding step:', error);
          return { data: undefined, error: error.message };
        }

        return { data: undefined, error: null };
      } catch (error) {
        console.error('Error in deleteOnboardingStep:', error);
        return { data: undefined, error: String(error) };
      }
    });
  }

  /**
   * Get business categories
   */
  async getBusinessCategories() {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('business_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching business categories:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Get service categories by business category
   */
  async getServiceCategoriesByBusinessCategory(businessCategoryId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('service_categories')
        .select('*')
        .eq('business_category_id', businessCategoryId)
        .order('name');

      if (error) {
        console.error('Error fetching service categories:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    });
  }

  /**
   * Check if user has a business profile
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
   * Get business profile
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
   * Create business profile
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
          status: 'active' as const
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
   * Update business profile
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
   * Upload a file
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
   * Mark a step as completed
   */
  async markStepAsCompleted(businessId: string, stepNumber: number) {
    return this.updateOnboardingStep(businessId, stepNumber, { status: 'completed', completed_at: new Date().toISOString() });
  }

  /**
   * Mark a step as incomplete
   */
  async markStepAsIncomplete(businessId: string, stepNumber: number) {
    return this.updateOnboardingStep(businessId, stepNumber, { status: 'pending', completed_at: null });
  }
}

// Export singleton instance
export const businessOnboardingService = BusinessOnboardingService.getInstance();