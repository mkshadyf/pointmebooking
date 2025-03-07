import { useToast } from '@/hooks/useToast';
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
}

export function useBusinessOnboarding(businessId?: string) {
  const { toast } = useToast();
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
    if (!businessId) return;
    
    try {
      setLoading(true);
      const result = await businessOnboardingService.getOnboardingStatus(businessId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.data) {
        // The result.data has the correct shape for OnboardingStatus
        const statusData: OnboardingStatus = result.data as unknown as OnboardingStatus;
        setStatus(statusData);
        // Set current step based on status
        setCurrentStep(statusData.currentStep - 1); // Convert from 1-indexed to 0-indexed
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      toast.error('Failed to fetch onboarding status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch business categories
  const fetchBusinessCategories = async () => {
    try {
      setLoading(true);
      const result = await businessOnboardingService.getBusinessCategories();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.data) {
        setBusinessCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching business categories:', error);
      toast.error('Failed to fetch business categories');
      setErrors({ ...errors, businessCategories: 'Failed to fetch business categories' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch service categories by business category
  const fetchServiceCategories = async (businessCategoryId: string) => {
    try {
      setLoading(true);
      const result = await businessOnboardingService.getServiceCategoriesByBusinessCategory(businessCategoryId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.data) {
        setServiceCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching service categories:', error);
      toast.error('Failed to fetch service categories');
      setErrors({ ...errors, serviceCategories: 'Failed to fetch service categories' });
    } finally {
      setLoading(false);
    }
  };

  // Update a step
  const updateStep = async (stepNumber: number, updates: any) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      // Use type assertion to handle the type mismatch
      const result = await businessOnboardingService.updateOnboardingStep(
        businessId, 
        stepNumber, 
        updates
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh the status
      await fetchOnboardingStatus();
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
      setErrors({ ...errors, updateStep: 'Failed to update step' });
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
    setStepData(prevData => ({ ...prevData, ...data }));
  };

  // Add submit function
  const submitOnboarding = async () => {
    if (!businessId) return false;
    
    try {
      setIsSubmitting(true);
      setErrors({ ...errors, submitOnboarding: '' });
      
      // Implementation would depend on the actual submission logic
      // This is a placeholder
      const result = await businessOnboardingService.completeOnboardingStep(businessId, currentStep + 1);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Business onboarding completed successfully');
      return true;
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast.error('Failed to complete onboarding');
      setErrors({ ...errors, submitOnboarding: 'Failed to complete onboarding' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (businessId) {
      fetchOnboardingStatus();
      fetchBusinessCategories();
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
  };
} 