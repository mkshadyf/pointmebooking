import { Database } from './generated.types';

/**
 * Business onboarding step database model
 */
export interface BusinessOnboardingStep {
  id: string;
  business_id: string;
  step_number: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  is_required: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * Response wrapper for business onboarding step operations
 */
export interface BusinessOnboardingStepResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Extended Database type that includes business_onboarding_steps
 * This is a temporary solution until the generated types are updated
 */
export interface ExtendedDatabase extends Database {
  public: {
    Tables: {
      business_onboarding_steps: {
        Row: BusinessOnboardingStep;
        Insert: Omit<BusinessOnboardingStep, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BusinessOnboardingStep, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [
          {
            foreignKeyName: "business_onboarding_steps_business_id_fkey";
            columns: ["business_id"];
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
    } & Database['public']['Tables'];
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
} 