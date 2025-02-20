// Re-export generated types
export * from './generated.types';

// Export shared interfaces and types
export * from './auth';
export * from './categories';

// Export common types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Activity {
  title: string;
  description: string;
  timestamp: string; // Or Date, if you convert it
  type: string; // e.g., 'booking', 'profile_update', etc.
  // Add any other fields you need from recent_activity
  business_id?: string; // Example: Add optional fields if they might not always be present
  customer_name?: string;
  // ... other fields ...
}

export * from './auth';
