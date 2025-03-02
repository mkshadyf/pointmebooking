'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BusinessProfile, UserProfile } from '@/types';
import { BusinessDetailsStep } from './steps/BusinessDetailsStep';
import { ContactInfoStep } from './steps/ContactInfoStep';
import { OperatingHoursStep } from './steps/OperatingHoursStep';
import { ServicesStep } from './steps/ServicesStep';
import CompletionStep from './steps/CompletionStep';

interface BusinessOnboardingProps {
  onComplete?: () => void;
}

export default function BusinessOnboarding({ onComplete }: BusinessOnboardingProps) {
  const { profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const convertToBusinessProfile = (userProfile: UserProfile | null): BusinessProfile | null => {
    if (!userProfile) return null;
    return {
      // UserProfile fields
      id: userProfile.id,
      full_name: userProfile.full_name,
      email: userProfile.email,
      role: userProfile.role,
      email_verified: userProfile.email_verified,
      // BusinessProfile specific fields
      business_name: userProfile.business_name || '',
      business_category: userProfile.business_category || '',
      business_type: userProfile.business_type,
      description: userProfile.description || '',
      location: userProfile.location || '',
      contact_number: userProfile.phone || userProfile.contact_number || '',
      working_hours: {
        monday: { start: '09:00', end: '17:00', is_closed: false },
        tuesday: { start: '09:00', end: '17:00', is_closed: false },
        wednesday: { start: '09:00', end: '17:00', is_closed: false },
        thursday: { start: '09:00', end: '17:00', is_closed: false },
        friday: { start: '09:00', end: '17:00', is_closed: false },
        saturday: { start: '09:00', end: '17:00', is_closed: false },
        sunday: { start: '09:00', end: '17:00', is_closed: true },
      },
      services: [],
      onboarding_completed: userProfile.onboarding_completed || false,
      // Optional fields from UserProfile
      address: userProfile.address,
      city: userProfile.city,
      state: userProfile.state,
      postal_code: userProfile.postal_code,
      contact_email: userProfile.contact_email,
      website: userProfile.website,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
    };
  };

  const businessProfile = convertToBusinessProfile(profile);

  const handleStepSubmit = async (data: Partial<BusinessProfile>) => {
    try {
      await updateProfile(data);
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleBackAction = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      component: BusinessDetailsStep,
      props: {
        initialData: businessProfile,
        onNextAction: handleStepSubmit,
      },
    },
    {
      component: ContactInfoStep,
      props: {
        initialData: businessProfile,
        onNextAction: handleStepSubmit,
        onBackAction: handleBackAction,
      },
    },
    {
      component: ServicesStep,
      props: {
        initialData: businessProfile,
        onNextAction: handleStepSubmit,
        onBackAction: handleBackAction,
      },
    },
    {
      component: OperatingHoursStep,
      props: {
        initialData: businessProfile,
        onNextAction: handleStepSubmit,
        onBackAction: handleBackAction,
      },
    },
    {
      component: CompletionStep,
      props: {
        initialData: businessProfile,
        onNextAction: handleStepSubmit,
        onBackAction: handleBackAction,
      },
    },
  ];

  const CurrentStepComponent = steps[currentStep].component;
  return <CurrentStepComponent {...steps[currentStep].props} />;
}
