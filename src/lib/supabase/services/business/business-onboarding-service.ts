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

// Define onboarding progress interface
export interface OnboardingProgress {
  id?: string;
  business_id: string;
  step_number: number;
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
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
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            select(columns: string): {
              eq(column: string, value: string): {
                order(column: string, options: { ascending: boolean }): {
                  data: any;
                  error: { message: string } | null;
                }
              }
            }
          }
        };
        
        const { data, error } = await supabase
          .from('business_onboarding_steps')
          .select('*')
          .eq('business_id', businessId)
          .order('step_number', { ascending: true });

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: data as BusinessOnboardingStep[], error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
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
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            select(columns: string): {
              eq(column: string, value: string | number): {
                eq(column: string, value: string | number): {
                  single(): {
                    data: any;
                    error: { message: string } | null;
                  }
                }
              }
            }
          }
        };
        
        const { data, error } = await supabase
          .from('business_onboarding_steps')
          .select('*')
          .eq('business_id', businessId)
          .eq('step_number', stepNumber)
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: data as BusinessOnboardingStep, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
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
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            update(data: any): {
              eq(column: string, value: string | number): {
                eq(column: string, value: string | number): {
                  select(columns: string): {
                    single(): {
                      data: any;
                      error: { message: string } | null;
                    }
                  }
                }
              }
            }
          }
        };
        
        const { data, error } = await supabase
          .from('business_onboarding_steps')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('business_id', businessId)
          .eq('step_number', stepNumber)
          .select('*')
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: data as BusinessOnboardingStep, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
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
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            update(data: any): {
              eq(column: string, value: string | number): {
                eq(column: string, value: string | number): {
                  select(columns: string): {
                    single(): {
                      data: any;
                      error: { message: string } | null;
                    }
                  }
                }
              }
            }
          }
        };
        
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('business_onboarding_steps')
          .update({
            status: 'completed',
            completed_at: now,
            updated_at: now
          })
          .eq('business_id', businessId)
          .eq('step_number', stepNumber)
          .select('*')
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: data as BusinessOnboardingStep, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
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
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            select(columns: string): {
              eq(column: string, value: string): {
                order(column: string, options: { ascending: boolean }): {
                  data: any;
                  error: { message: string } | null;
                }
              }
            }
          }
        };
        
        const { data, error } = await supabase
          .from('business_onboarding_steps')
          .select('*')
          .eq('business_id', businessId)
          .order('step_number', { ascending: true });

        if (error) {
          return { data: null, error: error.message };
        }

        const steps = data as BusinessOnboardingStep[];
        const totalSteps = steps.length;
        const completedSteps = steps.filter(step => step.status === 'completed').length;
        
        // Find the current step (first incomplete step)
        let currentStep = 1;
        for (const step of steps) {
          if (step.status !== 'completed') {
            currentStep = step.step_number;
            break;
          }
        }
        
        // If all steps are completed, set current step to the last step
        if (completedSteps === totalSteps && totalSteps > 0) {
          currentStep = totalSteps;
        }
        
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
      }
    });
  }
  
  /**
   * Get business categories
   */
  async getBusinessCategories(): Promise<BusinessOnboardingStepResponse<any[]>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            select(columns: string): {
              eq(column: string, value: string): {
                data: any;
                error: { message: string } | null;
              }
            }
          }
        };
        
        const { data, error } = await supabase
          .from('business_categories')
          .select('*')
          .eq('status', 'active');

        if (error) {
          return { data: null, error: error.message };
        }

        return { data, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
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
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            select(columns: string): {
              eq(column: string, value: string): {
                order(column: string, options: { ascending: boolean }): {
                  data: any;
                  error: { message: string } | null;
                }
              }
            }
          }
        };
        
        const { data, error } = await supabase
          .from('service_categories')
          .select('*')
          .eq('business_category_id', businessCategoryId)
          .order('name', { ascending: true });

        if (error) {
          return { data: null, error: error.message };
        }

        return { data, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
      }
    });
  }

  /**
   * Save onboarding progress data for a specific step
   * @param businessId The business ID
   * @param stepNumber The step number
   * @param data The step data to save
   * @returns The saved onboarding progress
   */
  async saveOnboardingProgress(
    businessId: string,
    stepNumber: number,
    data: Record<string, any>
  ): Promise<BusinessOnboardingStepResponse<OnboardingProgress>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            upsert(data: any, options?: { onConflict: string }): {
              select(columns: string): {
                single(): {
                  data: any;
                  error: { message: string } | null;
                }
              }
            }
          }
        };
        
        const now = new Date().toISOString();
        
        // Check if progress already exists
        const { data: existingData } = await client
          .from('onboarding_progress')
          .select('*')
          .eq('business_id', businessId)
          .eq('step_number', stepNumber)
          .single();
        
        // Prepare the data to upsert
        const progressData = {
          business_id: businessId,
          step_number: stepNumber,
          data,
          updated_at: now,
        };
        
        // If no existing data, add created_at
        if (!existingData) {
          (progressData as any).created_at = now;
        }
        
        // Upsert the progress data
        const { data: savedData, error } = await supabase
          .from('onboarding_progress')
          .upsert(progressData, { onConflict: 'business_id,step_number' })
          .select('*')
          .single();

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: savedData as OnboardingProgress, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
      }
    });
  }

  /**
   * Get onboarding progress data for a specific step
   * @param businessId The business ID
   * @param stepNumber The step number
   * @returns The onboarding progress data
   */
  async getOnboardingProgressForStep(
    businessId: string,
    stepNumber: number
  ): Promise<BusinessOnboardingStepResponse<OnboardingProgress>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            select(columns: string): {
              eq(column: string, value: string | number): {
                eq(column: string, value: string | number): {
                  single(): {
                    data: any;
                    error: { message: string } | null;
                  }
                }
              }
            }
          }
        };
        
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('business_id', businessId)
          .eq('step_number', stepNumber)
          .single();

        if (error) {
          // If no data found, return null without error
          if (error.message.includes('No rows found')) {
            return { data: null, error: null };
          }
          return { data: null, error: error.message };
        }

        return { data: data as OnboardingProgress, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
      }
    });
  }

  /**
   * Get all onboarding progress data for a business
   * @param businessId The business ID
   * @returns All onboarding progress data
   */
  async getAllOnboardingProgress(
    businessId: string
  ): Promise<BusinessOnboardingStepResponse<OnboardingProgress[]>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            select(columns: string): {
              eq(column: string, value: string): {
                order(column: string, options: { ascending: boolean }): {
                  data: any;
                  error: { message: string } | null;
                }
              }
            }
          }
        };
        
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('business_id', businessId)
          .order('step_number', { ascending: true });

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: data as OnboardingProgress[], error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
      }
    });
  }

  /**
   * Delete onboarding progress data for a specific step
   * @param businessId The business ID
   * @param stepNumber The step number
   * @returns Success or error
   */
  async deleteOnboardingProgress(
    businessId: string,
    stepNumber: number
  ): Promise<BusinessOnboardingStepResponse<void>> {
    return supabaseClientService.executeWithRetry(async (client) => {
      try {
        // Use a type assertion with unknown as an intermediate step
        const supabase = client as unknown as {
          from(table: string): {
            delete(): {
              eq(column: string, value: string | number): {
                eq(column: string, value: string | number): {
                  data: any;
                  error: { message: string } | null;
                }
              }
            }
          }
        };
        
        const { error } = await supabase
          .from('onboarding_progress')
          .delete()
          .eq('business_id', businessId)
          .eq('step_number', stepNumber);

        if (error) {
          return { data: null, error: error.message };
        }

        return { data: undefined, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { data: null, error: errorMessage };
      }
    });
  }
}

// Export the singleton instance
export const businessOnboardingService = BusinessOnboardingService.getInstance();

// Export helper functions for backward compatibility
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

export function getOnboardingStatus(businessId: string) {
  return BusinessOnboardingService.getInstance().getOnboardingStatus(businessId);
}

export function saveOnboardingProgress(businessId: string, stepNumber: number, data: Record<string, any>) {
  return BusinessOnboardingService.getInstance().saveOnboardingProgress(businessId, stepNumber, data);
}

export function getOnboardingProgressForStep(businessId: string, stepNumber: number) {
  return BusinessOnboardingService.getInstance().getOnboardingProgressForStep(businessId, stepNumber);
}

export function getAllOnboardingProgress(businessId: string) {
  return BusinessOnboardingService.getInstance().getAllOnboardingProgress(businessId);
}

export function deleteOnboardingProgress(businessId: string, stepNumber: number) {
  return BusinessOnboardingService.getInstance().deleteOnboardingProgress(businessId, stepNumber);
}

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

  static async saveOnboardingProgress(
    businessId: string,
    stepNumber: number,
    data: Record<string, any>
  ): Promise<BusinessOnboardingStepResponse<OnboardingProgress>> {
    return businessOnboardingService.saveOnboardingProgress(businessId, stepNumber, data);
  }

  static async getOnboardingProgressForStep(
    businessId: string,
    stepNumber: number
  ): Promise<BusinessOnboardingStepResponse<OnboardingProgress>> {
    return businessOnboardingService.getOnboardingProgressForStep(businessId, stepNumber);
  }

  static async getAllOnboardingProgress(
    businessId: string
  ): Promise<BusinessOnboardingStepResponse<OnboardingProgress[]>> {
    return businessOnboardingService.getAllOnboardingProgress(businessId);
  }

  static async deleteOnboardingProgress(
    businessId: string,
    stepNumber: number
  ): Promise<BusinessOnboardingStepResponse<void>> {
    return businessOnboardingService.deleteOnboardingProgress(businessId, stepNumber);
  }
} 