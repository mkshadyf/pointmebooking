'use client';

import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { AuthProfile, AuthRole } from '@/lib/supabase/types/auth.types';
import { BusinessDetailsStep, BusinessDetailsStepProps } from './steps/BusinessDetailsStep';
import { useState } from 'react';

interface BusinessOnboardingProps {
  onComplete?: () => void;
}

export default function BusinessOnboarding({ onComplete }: BusinessOnboardingProps) {
  const { profile, updateProfile } = useAuth();
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
    } else if (onComplete) {
      onComplete();
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
}
