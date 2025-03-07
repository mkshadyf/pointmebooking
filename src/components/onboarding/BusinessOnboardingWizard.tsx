'use client';

import { useBusinessOnboarding } from '@/hooks/business/useBusinessOnboarding';
import React from 'react';

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

// Helper function to get step label
const getStepLabel = (step: number): string => {
  switch (step) {
    case STEP_BASIC_INFO:
      return 'Basic Info';
    case STEP_CONTACT:
      return 'Contact';
    case STEP_LOCATION:
      return 'Location';
    case STEP_MEDIA:
      return 'Media';
    case STEP_SERVICES:
      return 'Services';
    case STEP_REVIEW:
      return 'Review';
    default:
      return '';
  }
};

// Step indicator component
const StepIndicator: React.FC<{ currentStep: number, totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-between mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            index < currentStep ? 'bg-green-500 text-white' : 
            index === currentStep ? 'bg-blue-500 text-white' : 
            'bg-gray-200 text-gray-500'
          }`}>
            {index + 1}
          </div>
          <span className="text-xs mt-1">{getStepLabel(index)}</span>
        </div>
      ))}
    </div>
  );
};

// Main component
const BusinessOnboardingWizard: React.FC = () => {
  const {
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
    categories,
    serviceCategories
  } = useBusinessOnboarding();

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
            categories={categories}
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
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      {renderCurrentStep()}
    </div>
  );
};

export default BusinessOnboardingWizard; 