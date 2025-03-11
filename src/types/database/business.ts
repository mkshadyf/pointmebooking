/**
 * Business-related type definitions
 */

// Business onboarding step interface
export interface BusinessOnboardingStep {
  id: string;
  business_id: string;
  step_number: number;
  title: string;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Business onboarding step response interface
export interface BusinessOnboardingStepResponse<T> {
  data: T | null;
  error: string | null;
}

// Business category interface
export interface BusinessCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Service category interface
export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  business_category_id: string | null;
  icon: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Business onboarding status interface
export interface BusinessOnboardingStatus {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  progress: number;
}

// Onboarding progress interface
export interface OnboardingProgress {
  id: string;
  business_id: string;
  step_number: number;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Onboarding progress response interface
export interface OnboardingProgressResponse {
  data: OnboardingProgress | OnboardingProgress[] | null;
  error: string | null;
} 