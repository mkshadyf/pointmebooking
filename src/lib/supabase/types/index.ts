import type { Database } from '@generated.types';

// Database utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Re-export the Database type
export type { Database };

// Database row types
export type DbProfile = Database['public']['Tables']['profiles']['Row'] & {
	working_hours?: Record<string, any>;
	preferences?: Record<string, any>;
	social_media?: Record<string, any>;
	created_at: string;
	updated_at: string;
};
export type DbService = Database['public']['Tables']['services']['Row'];
export type DbBooking = Tables<'bookings'>;
export type DbBusinessCategory = Tables<'business_categories'>;
export type DbServiceCategory = Tables<'service_categories'>;

// Base types
export type BusinessCategory = DbBusinessCategory;
export type ServiceCategory = DbServiceCategory & { service_count?: number };

// Insert types
export type ProfileInsert = Omit<DbProfile, 'id' | 'created_at' | 'updated_at' | 'user_id'> & {
	avatar_url?: string;
	business_logo?: string;
	verification_attempts?: number;
	last_verification_attempt?: string;
	email_verified?: boolean;
	is_verified?: boolean;
	is_email_verified?: boolean;
};
export type ServiceInsert = Omit<DbService, 'id' | 'created_at' | 'updated_at'>;
export type BookingInsert = Omit<DbBooking, 'id' | 'created_at' | 'updated_at'>;
export type BusinessCategoryInsert = Omit<DbBusinessCategory, 'id' | 'created_at' | 'updated_at'>;
export type ServiceCategoryInsert = Omit<DbServiceCategory, 'id' | 'created_at' | 'updated_at'>;

// Update types
export type ProfileUpdate = Partial<ProfileInsert>;
export type ServiceUpdate = Partial<ServiceInsert>;
export type BookingUpdate = Partial<BookingInsert>;
export type BusinessCategoryUpdate = Partial<BusinessCategoryInsert>;
export type ServiceCategoryUpdate = Partial<ServiceCategoryInsert>;

// Auth and Profile types
export type AuthRole = 'admin' | 'user' | 'business' | 'customer';
export type AuthProfile = DbProfile & {
	is_verified: boolean;
	is_email_verified: boolean;
	verification_attempts?: number;
	last_verification_attempt?: string | null;
	avatar_url?: string | null;
	business_logo?: string | null;
	logo_url?: string | null;
	working_hours?: Record<string, any>;
	preferences?: Record<string, any>;
	social_media?: Record<string, any>;
};

// Booking with relations
export type Booking = DbBooking & {
	service: DbService;
	customer: DbProfile;
	business: DbProfile;
};

// Service with relations
export type ServiceWithRelations = DbService & {
	business: DbProfile;
	category: DbServiceCategory;
};

// API response types
export interface ApiResponse<T> {
	data: T;
	count: number;
	error: string | null;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
}

// Supabase Auth Error
export interface SupabaseAuthError extends Error {
	status: number;
}

// Activity type
export interface Activity {
	id: string;
	title: string;
	description: string;
	timestamp: string;
	type: 'booking' | 'service' | 'profile' | 'system';
	status?: 'pending' | 'completed' | 'cancelled';
	metadata?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

