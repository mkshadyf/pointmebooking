import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/ui/useToast';
import { tryCatch, tryCatchWithRetry } from '@/lib/error/try-catch';
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
    if (!businessId) return;
    
    setLoading(true);
    
    const { data, error } = await tryCatch(
      async () => businessOnboardingService.getOnboardingStatus(businessId),
      user?.id,
      { action: 'fetchOnboardingStatus', businessId }
    );
    
    if (error) {
      console.error('Error fetching onboarding status:', error);
      toast.error('Failed to fetch onboarding status');
      setErrors(prev => ({ ...prev, onboardingStatus: 'Failed to fetch onboarding status' }));
    } else if (data?.data) {
      // The result.data has the correct shape for OnboardingStatus
      const statusData: OnboardingStatus = data.data as unknown as OnboardingStatus;
      setStatus(statusData);
      // Set current step based on status
      setCurrentStep(statusData.currentStep - 1); // Convert from 1-indexed to 0-indexed
    }
    
    setLoading(false);
  };

  // Fetch business categories
  const fetchBusinessCategories = async () => {
    setLoading(true);
    
    const { data, error } = await tryCatchWithRetry(
      async () => businessOnboardingService.getBusinessCategories(),
      2, // retries
      1000, // delay
      user?.id,
      { action: 'fetchBusinessCategories' }
    );
    
    if (error) {
      console.error('Error fetching business categories:', error);
      toast.error('Failed to fetch business categories');
      setErrors(prev => ({ ...prev, businessCategories: 'Failed to fetch business categories' }));
    } else if (data?.data) {
      setBusinessCategories(data.data);
    }
    
    setLoading(false);
  };

  // Fetch service categories by business category
  const fetchServiceCategories = async (businessCategoryId: string) => {
    setLoading(true);
    
    const { data, error } = await tryCatch(
      async () => businessOnboardingService.getServiceCategoriesByBusinessCategory(businessCategoryId),
      user?.id,
      { action: 'fetchServiceCategories', businessCategoryId }
    );
    
    if (error) {
      console.error('Error fetching service categories:', error);
      toast.error('Failed to fetch service categories');
      setErrors(prev => ({ ...prev, serviceCategories: 'Failed to fetch service categories' }));
    } else if (data?.data) {
      setServiceCategories(data.data);
    }
    
    setLoading(false);
  };

  // Update a step
  const updateStep = async (stepNumber: number, updates: any) => {
    if (!businessId) return;
    
    setLoading(true);
    
    const { data, error } = await tryCatch(
      async () => businessOnboardingService.updateOnboardingStep(businessId, stepNumber, updates),
      user?.id,
      { action: 'updateStep', businessId, stepNumber, updates }
    );
    
    if (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
      setErrors(prev => ({ ...prev, updateStep: 'Failed to update step' }));
    } else {
      // Refresh the status
      await fetchOnboardingStatus();
    }
    
    setLoading(false);
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
    
    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submitOnboarding: '' }));
    
    const { data, error } = await tryCatchWithRetry(
      async () => businessOnboardingService.completeOnboardingStep(businessId, currentStep + 1),
      2, // retries
      1000, // delay
      user?.id,
      { action: 'submitOnboarding', businessId, step: currentStep + 1 }
    );
    
    if (error) {
      console.error('Error submitting onboarding:', error);
      toast.error('Failed to complete onboarding');
      setErrors(prev => ({ ...prev, submitOnboarding: 'Failed to complete onboarding' }));
      setIsSubmitting(false);
      return false;
    }
    
    toast.success('Business onboarding completed successfully');
    setIsSubmitting(false);
    return true;
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