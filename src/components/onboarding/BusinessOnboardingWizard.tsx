'use client';

import { useBusinessOnboarding } from '@/hooks/business/useBusinessOnboarding';
import { useLocalStorage } from '@/hooks/core/useLocalStorage';
import { useToast } from '@/hooks/ui/useToast';
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
const SaveProgressButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button 
      type="button" 
      variant="outline" 
      className="mr-2"
      onClick={onClick}
    >
      Save Progress & Exit
    </Button>
  );
};

// Main component
const BusinessOnboardingWizard: React.FC = () => {
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
    serviceCategories  } = useBusinessOnboarding();
  
  const { toast } = useToast();
  
  // Add localStorage for progress persistence
  const [savedProgress, setSavedProgress] = useLocalStorage<{
    lastStep: number;
    data: Record<string, any>;
    timestamp: string;
  } | null>('business-onboarding-progress', null);
  
  // Load saved progress if available
  useEffect(() => {
    if (savedProgress && !loading) {
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
            toast.success("Your previous progress has been loaded.", {
              title: "Progress Restored"
            });
          }, 100);
        }
      } else {
        // Clear expired progress
        setSavedProgress(null);
      }
    }
  }, [loading]);
  
  // Save progress handler
  const handleSaveProgress = useCallback(() => {
    setSavedProgress({
      lastStep: currentStep,
      data: stepData,
      timestamp: new Date().toISOString()
    });
    
    toast.success("You can return later to continue your onboarding.", {
      title: "Progress Saved"
    });
    
    // Redirect to dashboard or homepage
    window.location.href = '/dashboard';
  }, [currentStep, stepData, setSavedProgress, toast]);

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
        <SaveProgressButton onClick={handleSaveProgress} />
      </div>
      
      {renderCurrentStep()}
    </div>
  );
};

export default BusinessOnboardingWizard; 