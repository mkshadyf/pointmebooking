/**
 * Centralized Types Export
 * 
 * This file re-exports all types from the generated types file and defines additional types
 * needed throughout the application.
 */

import type { Database, Tables } from '../../../types/database/generated.types';

// Re-export types
export type { Database, Tables };

// Define helper types for database operations
export type TableName = keyof Database['public']['Tables'];

export type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Define custom insertable and updatable types
export type Insertable<T extends TableName> = Omit<Insert<T>, 'id' | 'created_at' | 'updated_at'>;
export type Updatable<T extends TableName> = Omit<Update<T>, 'id' | 'created_at' | 'updated_at'>;

// Export other types
// Commented out to avoid import errors
// export * from './auth';
// export * from './business';
// export * from './service';
// export * from './profile';
// export * from './booking';
// export * from './schedule';
// export * from './session';

// Define and export common types
export type AuthProfile = Tables<'profiles'>;
export type Booking = Tables<'bookings'>;
export type BusinessCategory = Tables<'business_categories'>;
export type ServiceCategory = Tables<'service_categories'>;
export type Service = Tables<'services'>;
export type Business = Tables<'businesses'>;
export type Staff = Tables<'staff'>;
export type Schedule = Tables<'schedules'>;
export type ErrorLog = Tables<'error_logs'>;

// Define and export insert/update types
export type ProfileInsert = Insertable<'profiles'>;
export type ProfileUpdate = Updatable<'profiles'>;
export type BookingInsert = Insertable<'bookings'>;
export type BookingUpdate = Updatable<'bookings'>;
export type BusinessCategoryInsert = Insertable<'business_categories'>;
export type BusinessCategoryUpdate = Updatable<'business_categories'>;
export type ServiceCategoryInsert = Insertable<'service_categories'>;
export type ServiceCategoryUpdate = Updatable<'service_categories'>;
export type ServiceInsert = Insertable<'services'>;
export type ServiceUpdate = Updatable<'services'>;
export type BusinessInsert = Insertable<'businesses'>;
export type BusinessUpdate = Updatable<'businesses'>;

// Define database model types with prefixes
export type DbProfile = Tables<'profiles'>;
export type DbBooking = Tables<'bookings'>;
export type DbBusinessCategory = Tables<'business_categories'>;
export type DbServiceCategory = Tables<'service_categories'>;
export type DbService = Tables<'services'>;
export type DbBusiness = Tables<'businesses'>;

// Define response types
export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface ApiResponse<T> {
	data: T | null;
	error: {
		message: string;
		code: string;
		status: number;
	} | null;
}

// Auth error type
export interface SupabaseAuthError {
	name: string;
	message: string;
	code: string;
	status: number;
	details?: any;
}

// Service with relations type
export interface ServiceWithRelations extends Service {
	business?: Business;
	category?: ServiceCategory;
}

