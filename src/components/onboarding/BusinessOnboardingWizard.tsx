'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { useBusinessOnboarding } from '@/hooks/business/useBusinessOnboarding';
import { useLocalStorage } from '@/hooks/core/useLocalStorage';
import { ToastService } from '@/lib/core/toast';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect } from 'react';
import { Button } from '../ui/Button';

// Define interfaces for the form components
interface FormProps {
  data?: Record<string, any>;
  updateData?: (data: Record<string, any>) => void;
  onNext: () => void;
  onBack?: () => void;
  errors?: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

interface BusinessBasicInfoFormProps extends FormProps {
  categories: any[];
}

interface BusinessContactFormProps extends FormProps {}
interface BusinessLocationFormProps extends FormProps {}
interface BusinessMediaFormProps extends FormProps {}
interface BusinessServicesFormProps extends FormProps {
  serviceCategories: any[];
}

interface BusinessReviewFormProps {
  data?: Record<string, any>;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

// Define step indices
const STEP_BASIC_INFO = 0;
const STEP_CONTACT = 1;
const STEP_LOCATION = 2;
const STEP_MEDIA = 3;
const STEP_SERVICES = 4;
const STEP_REVIEW = 5;

// Define step names for better UX
const STEP_NAMES = [
  'Basic Information',
  'Contact Details',
  'Location',
  'Media & Branding',
  'Services',
  'Review & Submit'
];

// Create placeholder components
const BusinessBasicInfoForm: React.FC<BusinessBasicInfoFormProps> = ({ 
  onNext}) => (
  <div className="p-4 border rounded">
    <h2 className="text-xl mb-4">Business Basic Info</h2>
    <p>This is a placeholder for the Business Basic Info form.</p>
    <button 
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" 
      onClick={onNext}
    >
      Next
    </button>
  </div>
);

const BusinessContactForm: React.FC<BusinessContactFormProps> = ({ 
  onNext, onBack}) => (
  <div className="p-4 border rounded">
    <h2 className="text-xl mb-4">Business Contact</h2>
    <p>This is a placeholder for the Business Contact form.</p>
    <div className="flex gap-4 mt-4">
      <button 
        className="px-4 py-2 bg-gray-300 rounded" 
        onClick={onBack}
      >
        Back
      </button>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded" 
        onClick={onNext}
      >
        Next
      </button>
    </div>
  </div>
);

const BusinessLocationForm: React.FC<BusinessLocationFormProps> = ({ 
  onNext, onBack}) => (
  <div className="p-4 border rounded">
    <h2 className="text-xl mb-4">Business Location</h2>
    <p>This is a placeholder for the Business Location form.</p>
    <div className="flex gap-4 mt-4">
      <button 
        className="px-4 py-2 bg-gray-300 rounded" 
        onClick={onBack}
      >
        Back
      </button>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded" 
        onClick={onNext}
      >
        Next
      </button>
    </div>
  </div>
);

const BusinessMediaForm: React.FC<BusinessMediaFormProps> = ({ 
  onNext, onBack}) => (
  <div className="p-4 border rounded">
    <h2 className="text-xl mb-4">Business Media</h2>
    <p>This is a placeholder for the Business Media form.</p>
    <div className="flex gap-4 mt-4">
      <button 
        className="px-4 py-2 bg-gray-300 rounded" 
        onClick={onBack}
      >
        Back
      </button>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded" 
        onClick={onNext}
      >
        Next
      </button>
    </div>
  </div>
);

const BusinessServicesForm: React.FC<BusinessServicesFormProps> = ({ 
  onNext, onBack}) => (
  <div className="p-4 border rounded">
    <h2 className="text-xl mb-4">Business Services</h2>
    <p>This is a placeholder for the Business Services form.</p>
    <div className="flex gap-4 mt-4">
      <button 
        className="px-4 py-2 bg-gray-300 rounded" 
        onClick={onBack}
      >
        Back
      </button>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded" 
        onClick={onNext}
      >
        Next
      </button>
    </div>
  </div>
);

const BusinessReviewForm: React.FC<BusinessReviewFormProps> = ({ 
  onSubmit, onBack, isSubmitting 
}) => (
  <div className="p-4 border rounded">
    <h2 className="text-xl mb-4">Review Your Business</h2>
    <p>This is a placeholder for the Business Review form.</p>
    <div className="flex gap-4 mt-4">
      <button 
        className="px-4 py-2 bg-gray-300 rounded" 
        onClick={onBack}
      >
        Back
      </button>
      <button 
        className="px-4 py-2 bg-green-500 text-white rounded" 
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  </div>
);

/**
 * A responsive step indicator that shows progress in the onboarding flow
 */
const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center text-sm font-medium 
                ${index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="mt-2 text-xs text-center hidden md:block">
                {STEP_NAMES[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/**
 * Save Progress Button component to allow users to save and exit
 */
const SaveProgressButton: React.FC<{ onClick: () => void; loading?: boolean }> = ({ onClick, loading }) => {
  return (
    <Button 
      type="button" 
      variant="outline" 
      className="mr-2"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? 'Saving...' : 'Save Progress & Exit'}
    </Button>
  );
};

// Main component
const BusinessOnboardingWizard: React.FC = () => {
  const { profile } = useAuth();
  const businessId = profile?.id;
  
  const { 
    loading, 
    currentStep, 
    totalSteps, 
    stepData, 
    updateStepData, 
    goToNextStep, 
    goToPrevStep, 
    submitOnboarding,
    isSubmitting,
    errors,
    setErrors,
    businessCategories,
    serviceCategories,
    saveProgressToServer,
    loadProgressFromServer
  } = useBusinessOnboarding(businessId);
  
  const router = useRouter();
  
  // Add localStorage for progress persistence (as fallback)
  const [savedProgress, setSavedProgress] = useLocalStorage<{
    lastStep: number;
    data: Record<string, any>;
    timestamp: string;
  } | null>('business-onboarding-progress', null);
  
  // Load saved progress if available
  useEffect(() => {
    if (!loading && businessId) {
      // First try to load from server
      loadProgressFromServer().then(success => {
        // If server load fails, try local storage as fallback
        if (!success && savedProgress) {
          // Only load if saved data is less than 7 days old
          const savedDate = new Date(savedProgress.timestamp);
          const now = new Date();
          const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysDiff < 7) {
            updateStepData(savedProgress.data);
            if (savedProgress.lastStep < totalSteps) {
              // Go to the saved step
              setTimeout(() => {
                for (let i = 0; i < savedProgress.lastStep; i++) {
                  goToNextStep();
                }
                ToastService.success("Your previous progress has been loaded from local storage.", {
                  title: "Progress Restored",
                  duration: 5000
                });
              }, 100);
            }
          } else {
            // Clear expired progress
            setSavedProgress(null);
          }
        }
      }).catch(error => {
        console.error('Error loading progress:', error);
      });
    }
  }, [loading, businessId, savedProgress, totalSteps, updateStepData, goToNextStep, loadProgressFromServer, setSavedProgress]);
  
  // Save progress handler
  const handleSaveProgress = useCallback(async () => {
    // First try to save to server
    if (businessId) {
      const success = await saveProgressToServer();
      
      // If server save fails, save to local storage as fallback
      if (!success) {
        setSavedProgress({
          lastStep: currentStep,
          data: stepData,
          timestamp: new Date().toISOString()
        });
        
        ToastService.info("Progress saved locally. For best results, please ensure you're connected to the internet.", {
          title: "Progress Saved Locally",
          duration: 5000
        });
      } else {
        // Clear local storage if server save succeeds
        setSavedProgress(null);
      }
    } else {
      // If no business ID, save to local storage
      setSavedProgress({
        lastStep: currentStep,
        data: stepData,
        timestamp: new Date().toISOString()
      });
      
      ToastService.info("Progress saved locally. Please log in to save your progress to the server.", {
        title: "Progress Saved Locally",
        duration: 5000
      });
    }
    
    // Redirect to dashboard or homepage
    router.push('/dashboard');
  }, [currentStep, stepData, setSavedProgress, router, businessId, saveProgressToServer]);

  // Auto-save progress periodically
  useEffect(() => {
    // Only auto-save if we have a business ID
    if (!businessId) return;
    
    // Save progress every 2 minutes
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(stepData).length > 0) {
        saveProgressToServer().then(success => {
          if (success) {
            console.log('Auto-saved onboarding progress to server');
          }
        }).catch(error => {
          console.error('Error auto-saving progress:', error);
        });
      }
    }, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(autoSaveInterval);
  }, [stepData, businessId, saveProgressToServer]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEP_BASIC_INFO:
        return (
          <BusinessBasicInfoForm
            data={stepData}
            updateData={updateStepData}
            onNext={goToNextStep}
            errors={errors}
            setErrors={setErrors}
            categories={businessCategories}
          />
        );
      case STEP_CONTACT:
        return (
          <BusinessContactForm
            data={stepData}
            updateData={updateStepData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case STEP_LOCATION:
        return (
          <BusinessLocationForm
            data={stepData}
            updateData={updateStepData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case STEP_MEDIA:
        return (
          <BusinessMediaForm
            data={stepData}
            updateData={updateStepData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case STEP_SERVICES:
        return (
          <BusinessServicesForm
            data={stepData}
            updateData={updateStepData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
            errors={errors}
            setErrors={setErrors}
            serviceCategories={serviceCategories}
          />
        );
      case STEP_REVIEW:
        return (
          <BusinessReviewForm
            data={stepData}
            onSubmit={async () => {
              await submitOnboarding();
            }}
            onBack={goToPrevStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Business Onboarding</h1>
      
      {/* Replace the existing step indicator with our enhanced version */}
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      
      {/* Add a save progress button at the top */}
      <div className="mb-6 flex justify-end">
        <SaveProgressButton onClick={handleSaveProgress} loading={loading} />
      </div>
      
      {renderCurrentStep()}
    </div>
  );
};

export default BusinessOnboardingWizard; 