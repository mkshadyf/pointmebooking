import { Database } from '@/types/database/generated.types';
import { supabase } from '../client/browser';
import { BaseServiceUtils } from './BaseService';
import { businessCategoryService } from './categories/business-category.service';
import { serviceCategoryService } from './categories/service-category.service';

/**
 * Service to handle business onboarding workflow
 * This service provides methods for creating and managing business profiles
 * and handling the business onboarding flow
 */
export class BusinessOnboardingService extends BaseServiceUtils {
  private static instance: BusinessOnboardingService;

  private constructor() {
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
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return false;
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
      
    if (!profile) {
      return false;
    }
    
    // Check if user has a business
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_profile_id', profile.id)
      .maybeSingle();
      
    return !!data;
  }
  
  /**
   * Get the onboarding status for the current user
   * @returns Object with onboarding status information
   */
  async getOnboardingStatus() {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { isBusinessUser: false, onboardingCompleted: false };
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('user_id', session.user.id)
      .single();
      
    if (!profile) {
      return { isBusinessUser: false, onboardingCompleted: false };
    }
    
    return {
      isBusinessUser: profile.role === 'business',
      onboardingCompleted: !!profile.onboarding_completed
    };
  }
  
  /**
   * Get business profile for the current user
   * @returns The user's business profile if it exists
   */
  async getBusinessProfile() {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return null;
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
      
    if (!profile) {
      return null;
    }
    
    // Get business profile
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        business_category:business_categories(*)
      `)
      .eq('owner_profile_id', profile.id)
      .single();
      
    if (error || !data) {
      return null;
    }
    
    return data;
  }
  
  /**
   * Create a new business profile for the current user
   * @param businessData The business data to create
   * @returns The created business profile
   */
  async createBusinessProfile(businessData: Database['public']['Tables']['businesses']['Insert']) {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
      
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    // Check if user already has a business
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_profile_id', profile.id)
      .maybeSingle();
      
    if (existingBusiness) {
      throw new Error('User already has a business profile');
    }
    
    // Create business profile
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        ...businessData,
        owner_profile_id: profile.id,
        status: 'active'
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error creating business profile: ${error.message}`);
    }
    
    // Update user profile to mark onboarding as completed
    await supabase
      .from('profiles')
      .update({
        role: 'business',
        onboarding_completed: true
      })
      .eq('id', profile.id);
      
    return data;
  }
  
  /**
   * Update an existing business profile
   * @param businessId The ID of the business to update
   * @param businessData The business data to update
   * @returns The updated business profile
   */
  async updateBusinessProfile(
    businessId: string, 
    businessData: Database['public']['Tables']['businesses']['Update']
  ) {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
      
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    // Verify business ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_profile_id', profile.id)
      .single();
      
    if (!business) {
      throw new Error('Business not found or not owned by user');
    }
    
    // Update business profile
    const { data, error } = await supabase
      .from('businesses')
      .update(businessData)
      .eq('id', businessId)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error updating business profile: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Upload a file to Supabase storage
   * @param file The file to upload
   * @param bucket The storage bucket name
   * @param path The path within the bucket
   * @returns The public URL of the uploaded file
   */
  async uploadFile(file: File, bucket: string, path: string) {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(path, file, { upsert: true });
      
    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
    
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path);
      
    return publicUrl;
  }
}

// Export a singleton instance
export const businessOnboardingService = BusinessOnboardingService.getInstance();

// For backward compatibility, expose static methods
export class BusinessOnboardingServiceStatic extends BaseServiceUtils {
  static async getBusinessCategories() {
    return businessOnboardingService.getBusinessCategories();
  }
  
  static async getServiceCategoriesByBusinessCategory(businessCategoryId: string) {
    return businessOnboardingService.getServiceCategoriesByBusinessCategory(businessCategoryId);
  }
  
  static async hasBusinessProfile() {
    return businessOnboardingService.hasBusinessProfile();
  }
  
  static async getOnboardingStatus() {
    return businessOnboardingService.getOnboardingStatus();
  }
  
  static async getBusinessProfile() {
    return businessOnboardingService.getBusinessProfile();
  }
  
  static async createBusinessProfile(businessData: Database['public']['Tables']['businesses']['Insert']) {
    return businessOnboardingService.createBusinessProfile(businessData);
  }
  
  static async updateBusinessProfile(
    businessId: string, 
    businessData: Database['public']['Tables']['businesses']['Update']
  ) {
    return businessOnboardingService.updateBusinessProfile(businessId, businessData);
  }
  
  static async uploadFile(file: File, bucket: string, path: string) {
    return businessOnboardingService.uploadFile(file, bucket, path);
  }
} 