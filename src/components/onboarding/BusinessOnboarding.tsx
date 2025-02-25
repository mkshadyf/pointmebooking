'use client';

import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { AuthProfile, AuthRole } from '@/types/database/auth';
import { BusinessDetailsStep, BusinessDetailsStepProps } from './steps/BusinessDetailsStep';
import { useState } from 'react';

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


  const businessDetailsProps: BusinessDetailsStepProps = {
    data: {
      businessName: profile?.business_name || '',
      businessType: profile?.business_type || '',
      description: profile?.description || ''
    },
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
