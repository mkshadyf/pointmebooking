import { useAuth } from '@/hooks/auth/useAuth';
import { ToastService } from '@/lib/core/toast';
import { tryCatchWithRetry } from '@/lib/error/try-catch';
import { businessOnboardingService } from '@/lib/supabase/services/business/business-onboarding-service';
import {
    BusinessCategory,
    ServiceCategory
} from '@/types/database/business';
import { BusinessOnboardingStep } from '@/types/database/extensions';
import { useEffect, useState } from 'react';

// Define the number of steps
const TOTAL_STEPS = 6;

// Define the onboarding status type
interface OnboardingStatus {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  progress: number;
  data?: Record<string, any>;
  isComplete?: boolean;
}

export function useBusinessOnboarding(businessId?: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [steps] = useState<BusinessOnboardingStep[]>([]);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add missing properties
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const totalSteps = TOTAL_STEPS;

  // Fetch onboarding status
  const fetchOnboardingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business/onboarding/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch onboarding status');
      }
      
      const data = await response.json();
      setStatus(data);
      setCurrentStep(data.currentStep - 1); // Convert from 1-indexed to 0-indexed
      return data;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      ToastService.error('Failed to fetch onboarding status');
      setErrors(prev => ({ ...prev, onboardingStatus: 'Failed to fetch onboarding status' }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch business categories
  const fetchBusinessCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch business categories');
      }
      
      const data = await response.json();
      setBusinessCategories(data);
      return data;
    } catch (error) {
      console.error('Error fetching business categories:', error);
      ToastService.error('Failed to fetch business categories');
      setErrors(prev => ({ ...prev, businessCategories: 'Failed to fetch business categories' }));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch service categories
  const fetchServiceCategories = async (businessCategoryId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/categories/${businessCategoryId}/services`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch service categories');
      }
      
      const data = await response.json();
      setServiceCategories(data);
      return data;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      ToastService.error('Failed to fetch service categories');
      setErrors(prev => ({ ...prev, serviceCategories: 'Failed to fetch service categories' }));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update onboarding step
  const updateStep = async (step: number, data: any) => {
    try {
      setLoading(true);
      
      // Save to server-side storage
      if (businessId) {
        const { error } = await businessOnboardingService.saveOnboardingProgress(
          businessId,
          step,
          data
        );
        
        if (error) {
          throw new Error(error);
        }
      }
      
      // Also update the API for backward compatibility
      const response = await fetch('/api/business/onboarding/step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step, data }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update step');
      }
      
      const responseData = await response.json();
      setStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentStep: step,
          data: { ...(prev.data || {}), ...data }
        };
      });
      return responseData;
    } catch (error) {
      console.error('Error updating step:', error);
      ToastService.error('Failed to update step');
      setErrors(prev => ({ ...prev, updateStep: 'Failed to update step' }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Complete onboarding
  const completeOnboarding = async (finalData: any) => {
    try {
      setLoading(true);
      
      // Save final data to server-side storage
      if (businessId) {
        const { error } = await businessOnboardingService.saveOnboardingProgress(
          businessId,
          TOTAL_STEPS, // Use the total steps as the final step number
          finalData
        );
        
        if (error) {
          throw new Error(error);
        }
      }
      
      const response = await fetch('/api/business/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }
      
      const data = await response.json();
      setStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isComplete: true,
          currentStep: prev.totalSteps,
          data: { ...(prev.data || {}), ...finalData }
        };
      });
      
      ToastService.success('Business onboarding completed successfully');
      return data;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      ToastService.error('Failed to complete onboarding');
      setErrors(prev => ({ ...prev, submitOnboarding: 'Failed to complete onboarding' }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  // Add data update function
  const updateStepData = (data: Record<string, any>) => {
    setStepData(prevData => {
      const newData = { ...prevData, ...data };
      
      // Save to server-side storage if businessId is available
      if (businessId) {
        businessOnboardingService.saveOnboardingProgress(
          businessId,
          currentStep + 1, // Convert to 1-indexed for the server
          newData
        ).catch(error => {
          console.error('Error saving progress to server:', error);
        });
      }
      
      return newData;
    });
  };

  // Add submit function
  const submitOnboarding = async () => {
    if (!businessId) return false;
    
    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submitOnboarding: '' }));
    
    // Save current step data to server-side storage
    const saveResult = await businessOnboardingService.saveOnboardingProgress(
      businessId,
      currentStep + 1, // Convert to 1-indexed for the server
      stepData
    );
    
    if (saveResult.error) {
      console.error('Error saving progress to server:', saveResult.error);
      ToastService.error('Failed to save progress');
      setErrors(prev => ({ ...prev, submitOnboarding: 'Failed to save progress' }));
      setIsSubmitting(false);
      return false;
    }
    
    const { error } = await tryCatchWithRetry(
      async () => businessOnboardingService.completeOnboardingStep(businessId, currentStep + 1),
      2, // retries
      1000, // delay
      user?.id,
      { action: 'submitOnboarding', businessId, step: currentStep + 1 }
    );
    
    if (error) {
      console.error('Error submitting onboarding:', error);
      ToastService.error('Failed to complete onboarding');
      setErrors(prev => ({ ...prev, submitOnboarding: 'Failed to complete onboarding' }));
      setIsSubmitting(false);
      return false;
    }
    
    ToastService.success('Business onboarding completed successfully');
    setIsSubmitting(false);
    return true;
  };

  // Save progress to server
  const saveProgressToServer = async () => {
    if (!businessId) return false;
    
    setLoading(true);
    
    try {
      const { error } = await businessOnboardingService.saveOnboardingProgress(
        businessId,
        currentStep + 1, // Convert to 1-indexed for the server
        stepData
      );
      
      if (error) {
        throw new Error(error);
      }
      
      ToastService.success('Progress saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving progress to server:', error);
      ToastService.error('Failed to save progress');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load progress from server
  const loadProgressFromServer = async () => {
    if (!businessId) return false;
    
    setLoading(true);
    
    try {
      // Get all progress data
      const { data, error } = await businessOnboardingService.getAllOnboardingProgress(businessId);
      
      if (error) {
        throw new Error(error);
      }
      
      if (!data || data.length === 0) {
        return false;
      }
      
      // Combine all step data
      const combinedData: Record<string, any> = {};
      let maxStep = 0;
      
      data.forEach(progress => {
        Object.assign(combinedData, progress.data);
        if (progress.step_number > maxStep) {
          maxStep = progress.step_number;
        }
      });
      
      // Update state
      setStepData(combinedData);
      
      // Go to the last step that has data
      if (maxStep > 0) {
        setCurrentStep(maxStep - 1); // Convert to 0-indexed
      }
      
      ToastService.success('Progress loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading progress from server:', error);
      ToastService.error('Failed to load progress');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (businessId) {
      fetchOnboardingStatus();
      fetchBusinessCategories();
      
      // Load progress from server
      loadProgressFromServer().catch(error => {
        console.error('Error loading progress from server:', error);
      });
    }
  }, [businessId]);

  return {
    loading,
    steps,
    status,
    businessCategories,
    serviceCategories,
    selectedBusinessCategory,
    setSelectedBusinessCategory,
    fetchOnboardingStatus,
    fetchServiceCategories,
    updateStep,
    currentStep,
    totalSteps,
    stepData,
    updateStepData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    submitOnboarding,
    isSubmitting,
    errors,
    setErrors,
    categories: businessCategories,
    completeOnboarding,
    saveProgressToServer,
    loadProgressFromServer,
  };
} 