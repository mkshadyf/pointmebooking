import { Database as OriginalDatabase } from './generated.types';

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
 * Extended Database type that includes missing tables
 */
export interface ExtendedDatabase extends OriginalDatabase {
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
    } & OriginalDatabase['public']['Tables'];
    Views: OriginalDatabase['public']['Views'];
    Functions: {
      get_category_counts: {
        Args: {
          limit_count: number;
        };
        Returns: {
          category_id: string;
          count: number;
        }[];
      };
    } & OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}

// Export the extended database type as the main Database type
export type Database = ExtendedDatabase;

// Export additional types for convenience
export type Tables = ExtendedDatabase['public']['Tables'];
export type Enums = ExtendedDatabase['public']['Enums'];

// Helper type for insertable rows
export type Insertable<T extends keyof Tables> = Tables[T]['Insert'];

// Helper type for updatable rows
export type Updatable<T extends keyof Tables> = Tables[T]['Update'];
