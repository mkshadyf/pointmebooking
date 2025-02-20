// Define the types locally since they're specific to the auth form components
export interface AuthFormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export type AuthFormData = Record<string, string>; 