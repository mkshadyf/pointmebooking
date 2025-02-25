import { ApprovalStatus, Business, Category, Service, ServiceStatus } from '@/types';
import { Database } from '@generated.types';

// Type aliases for better readability
type DbService = Database['public']['Tables']['services']['Row'] & {
  // Add missing properties that might not be in the generated types
  created_by_id?: string | null;
  approved_by_id?: string | null;
  approved_at?: string | null;
  featured?: boolean | null;
  featured_order?: number | null;
  approval_status?: string | null;
  admin_notes?: string | null;
};
type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbCategory = Database['public']['Tables']['service_categories']['Row'];

/**
 * Transforms a database service record into a Service object
 * @param serviceData Database service record
 * @param includeRelations Optional related data (business, category)
 * @returns Fully typed Service object
 */
export function transformServiceData(
  serviceData: DbService | null, 
  includeRelations?: {
    business?: DbProfile | null;
    category?: DbCategory | null;
  }
): Service | null {
  if (!serviceData) return null;

  // Transform business data if available
  const business = includeRelations?.business ? transformBusinessData(includeRelations.business) : undefined;
  
  // Transform category data if available
  const category = includeRelations?.category ? transformCategoryData(includeRelations.category) : undefined;

  // Create the service object with all required fields
  return {
    id: serviceData.id,
    business_id: serviceData.business_id,
    name: serviceData.name,
    description: serviceData.description,
    price: serviceData.price,
    duration: serviceData.duration,
    image_url: serviceData.image_url,
    is_available: serviceData.is_available,
    status: serviceData.status as ServiceStatus,
    category_id: serviceData.category_id,
    created_at: serviceData.created_at,
    updated_at: serviceData.updated_at,
    // Handle optional fields with fallbacks
    created_by_id: serviceData.created_by_id || null,
    approved_by_id: serviceData.approved_by_id || null,
    approved_at: serviceData.approved_at || null,
    featured: serviceData.featured || false,
    featured_order: serviceData.featured_order || null,
    approval_status: (serviceData.approval_status as ApprovalStatus) || 'pending',
    admin_notes: serviceData.admin_notes || null,
    // Include related data if available
    business,
    category
  };
}

/**
 * Transforms a database profile record into a Business object
 * @param profileData Database profile record
 * @returns Fully typed Business object
 */
export function transformBusinessData(profileData: DbProfile | null): Business | undefined {
  if (!profileData) return undefined;
  
  return {
    id: profileData.id,
    name: profileData.business_name || '',
    description: profileData.description || undefined,
    address: profileData.address || undefined,
    city: profileData.city || undefined,
    state: profileData.state || undefined,
    phone: profileData.phone || undefined,
    email: profileData.email || undefined,
    logo_url: profileData.avatar_url || undefined
  };
}

/**
 * Transforms a database category record into a Category object
 * @param categoryData Database category record
 * @returns Fully typed Category object
 */
export function transformCategoryData(categoryData: DbCategory | null): Category | undefined {
  if (!categoryData) return undefined;
  
  return {
    id: categoryData.id,
    name: categoryData.name || '',
    icon: categoryData.icon || undefined
  };
}

/**
 * Transforms a Supabase join result into a Service object with relations
 * @param joinResult Result from a Supabase join query
 * @returns Fully typed Service object with relations
 */
export function transformJoinedServiceData(joinResult: any): Service | null {
  if (!joinResult) return null;
  
  // Extract the main service data
  const serviceData = joinResult as DbService;
  
  // Extract related data
  const business = joinResult.business as DbProfile;
  const category = joinResult.category as DbCategory;
  
  // Use the main transformer with relations
  return transformServiceData(serviceData, { business, category });
} 