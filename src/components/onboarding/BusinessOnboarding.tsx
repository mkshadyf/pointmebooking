'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { AuthProfile, AuthRole } from '@/types/database/auth';
import { useState } from 'react';
import { BusinessDetailsStep, BusinessDetailsStepProps } from './steps/BusinessDetailsStep';

interface BusinessOnboardingProps {
  onboardingComplete: () => void;
}

const BusinessOnboarding: React.FC<BusinessOnboardingProps> = ({ onboardingComplete }) => {
  const { updateProfile, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = (field: string, value: string) => {
    const updates: Partial<AuthProfile> = {
      [field === 'businessName' ? 'business_name' : 
       field === 'businessType' ? 'business_type' : field]: value,
      role: 'business' as AuthRole
    };
    updateProfile(updates);
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (onboardingComplete) {
      onboardingComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Use type assertion for the profile object
  const formattedProfile = {
    businessName: (profile as any)?.business_name || '',
    businessType: (profile as any)?.business_type || '',
    description: (profile as any)?.description || ''
  };

  const businessDetailsProps: BusinessDetailsStepProps = {
    data: formattedProfile,
    onChange: handleStepChange,
    onNext: handleNext,
    onBack: handleBack
  };

  const steps = [
    {
      component: BusinessDetailsStep,
      props: businessDetailsProps
    },
    // ... other steps with their appropriate props
  ];

  const CurrentStepComponent = steps[currentStep].component;
  return <CurrentStepComponent {...steps[currentStep].props} />;
};

export default BusinessOnboarding;
