import { ApprovalStatus, Business, Category, ServiceStatus, UIService } from '@/types';
import { Database } from '@generated.types';

// Type aliases for better readability
type DbService = Database['public']['Tables']['services']['Row'];
type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbCategory = Database['public']['Tables']['service_categories']['Row'];
type DbBusiness = Database['public']['Tables']['businesses']['Row'];

// Update the UIService type if it's defined locally (otherwise keep importing it)
// interface UIService extends DbService {
//   max_capacity?: number;
//   location?: string;
//   business?: {
//     id: string;
//     name: string;
//     logo_url: string;
//   };
//   category?: {
//     id: string;
//     name: string;
//     icon: string;
//   };
// }

// Extended interfaces for transformations
interface ExtendedBusiness extends Business {
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  services?: UIService[];
  category?: Category;
}

/**
 * EntityTransformer provides consistent entity transformation logic
 * for converting database entities to UI/domain entities
 */
export class EntityTransformer {
  /**
   * Transforms a database service record into a UIService object
   * @param serviceData Database service record
   * @param includeRelations Optional related data to include
   * @returns Fully typed UIService object or null if input is null/undefined
   */
  static transformService(
    serviceData: DbService | null | undefined, 
    includeRelations?: {
      business?: DbBusiness | null | undefined;
      category?: DbCategory | null | undefined;
    }
  ): UIService | null {
    if (!serviceData) return null;
    
    try {
      // Extract related data if provided
      const business = includeRelations?.business 
        ? this.transformBusiness(includeRelations.business)
        : undefined;
      
      const category = includeRelations?.category
        ? this.transformCategoryData(includeRelations.category)
        : undefined;

      // Create a properly typed UIService object with safe fallbacks
      const result: UIService = {
        id: serviceData.id,
        business_id: serviceData.business_id,
        name: serviceData.name || '',
        description: serviceData.description || '',
        price: serviceData.price || 0,
        duration: serviceData.duration || 0,
        image_url: serviceData.image_url || '',
        is_available: serviceData.is_available === true, // Explicitly check for true
        status: (serviceData.status as ServiceStatus) || 'active',
        category_id: serviceData.category_id || null,
        created_at: serviceData.created_at || new Date().toISOString(),
        updated_at: serviceData.updated_at || new Date().toISOString(),
        // Add only fields that exist on the UIService type
        created_by_id: serviceData.created_by_id || null,
        approved_by_id: serviceData.approved_by_id || null,
        approved_at: serviceData.approved_at || null,
        featured: serviceData.featured === true, // Explicitly check for true
        featured_order: serviceData.featured_order || null,
        approval_status: (serviceData.approval_status as ApprovalStatus) || 'pending',
        admin_notes: serviceData.admin_notes || null,
      } as UIService; // Force type assertion here as we know we're creating a valid UIService
      
      // Add related entities if available using optional chaining
      if (business) {
        result.business = {
          id: business.id,
          name: business.name || '',
          logo_url: business.logo_url || ''
        };
      }
      
      if (category) {
        result.category = {
          id: category.id,
          name: category.name || '',
          icon: category.icon || ''
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error transforming service:', error);
      return null;
    }
  }

  /**
   * Transforms a database profile record into a Business object
   * @param profileData Database profile record
   * @returns Fully typed Business object
   */
  static transformBusinessData(profileData: DbProfile | null | undefined): Business | undefined {
    if (!profileData) return undefined;
    
    try {
      // Create a business object using only the fields from DbProfile that are needed for Business
      return {
        id: profileData.id,
        name: profileData.full_name || '',
        description: '', // Default value as Business expects this field
        address: '', // Default value as Business expects this field
        city: '', // Default value as Business expects this field
        state: '', // Default value as Business expects this field
        phone: '', // Default value as Business expects this field
        email: profileData.email || '',
        logo_url: profileData.avatar_url || ''
      };
    } catch (error) {
      console.error('Error transforming business data:', error);
      return undefined;
    }
  }

  /**
   * Transforms a database category record into a Category object
   * @param categoryData Database category record
   * @returns Fully typed Category object
   */
  static transformCategoryData(categoryData: DbCategory | null | undefined): Category | undefined {
    if (!categoryData) return undefined;
    
    try {
      return {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description || '',
        icon: categoryData.icon || ''
      };
    } catch (error) {
      console.error('Error transforming category data:', error);
      return undefined;
    }
  }

  /**
   * Transforms a database business record with relations into an ExtendedBusiness object
   * @param businessData Database business record
   * @param includeRelations Optional related data to include
   * @returns Fully typed ExtendedBusiness object
   */
  static transformBusinessWithRelations(
    businessData: DbBusiness | null | undefined,
    includeRelations?: {
      owner?: DbProfile | null | undefined;
      services?: DbService[] | null | undefined;
      category?: DbCategory | null | undefined;
    }
  ): ExtendedBusiness | undefined {
    if (!businessData) return undefined;
    
    try {
      // Transform the base business data
      const business = this.transformBusiness(businessData);
      if (!business) return undefined;
      
      // Create an extended business object with relations
      const extendedBusiness: ExtendedBusiness = {
        ...business
      };
      
      // Add owner if provided
      if (includeRelations?.owner) {
        extendedBusiness.owner = {
          id: includeRelations.owner.id,
          name: includeRelations.owner.full_name || '',
          email: includeRelations.owner.email || ''
        };
      }
      
      // Add services if provided
      if (includeRelations?.services && includeRelations.services.length > 0) {
        extendedBusiness.services = includeRelations.services
          .map(service => this.transformService(service))
          .filter(Boolean) as UIService[];
      }
      
      // Add category if provided
      if (includeRelations?.category) {
        extendedBusiness.category = this.transformCategoryData(includeRelations.category);
      }
      
      return extendedBusiness;
    } catch (error) {
      console.error('Error transforming business with relations:', error);
      return undefined;
    }
  }

  /**
   * Transforms a database business record into a Business object
   * @param businessData Database business record
   * @returns Fully typed Business object
   */
  static transformBusiness(businessData: DbBusiness | null | undefined): Business | undefined {
    if (!businessData) return undefined;
    
    try {
      return {
        id: businessData.id,
        name: businessData.name,
        description: businessData.description || '',
        address: businessData.address || '',
        city: businessData.city || '',
        state: businessData.state || '',
        phone: businessData.phone || '',
        email: businessData.email || '',
        logo_url: businessData.banner_url || '' // Using banner_url as logo_url
      };
    } catch (error) {
      console.error('Error transforming business:', error);
      return undefined;
    }
  }
}

// For backward compatibility
export const transformServiceData = EntityTransformer.transformService.bind(EntityTransformer);
export const transformBusinessData = EntityTransformer.transformBusinessData.bind(EntityTransformer);
export const transformCategoryData = EntityTransformer.transformCategoryData.bind(EntityTransformer);
export const transformJoinedServiceData = EntityTransformer.transformService.bind(EntityTransformer);

/**
 * @deprecated Use EntityTransformer.transformService instead
 */
export function toUIService(service: DbService): UIService {
  return EntityTransformer.transformService(service) || {
    id: service.id,
    business_id: service.business_id,
    name: service.name,
    description: service.description || '',
    price: service.price,
    duration: service.duration,
    image_url: service.image_url || '',
    is_available: service.is_available === null ? true : service.is_available,
    status: (service.status as ServiceStatus) || 'active',
    category_id: service.category_id,
    created_at: service.created_at || new Date().toISOString(),
    updated_at: service.updated_at || new Date().toISOString(),
    max_capacity: 1,
    location: '',
    created_by_id: null,
    approved_by_id: null,
    approved_at: null,
    featured: false,
    featured_order: null,
    approval_status: 'pending',
    admin_notes: null
  };
}

/**
 * @deprecated Use EntityTransformer.transformBusiness instead
 */
export function toUIBusiness(business: DbBusiness): Business {
  return {
    id: business.id,
    name: business.name,
    description: business.description || '',
    address: business.address || '',
    city: business.city || '',
    state: business.state || '',
    phone: business.phone || '',
    email: business.email || '',
    logo_url: business.banner_url || ''
  };
}

/**
 * A safer generic transformer that ensures type safety
 * @param source The source object to transform
 * @param transform Function that transforms the source to destination type
 * @param defaultValue Default value if source is null/undefined
 * @returns The transformed object or defaultValue
 */
export function safeTransform<T, R>(
  source: T | null | undefined, 
  transform: (validSource: T) => R, 
  defaultValue: R | null = null
): R | null {
  if (source === null || source === undefined) {
    return defaultValue;
  }
  
  try {
    return transform(source);
  } catch (error) {
    console.error('Error in safeTransform:', error);
    return defaultValue;
  }
}

/**
 * Safe property accessor that handles nulls and undefined
 * @param obj The object to access property from
 * @param key The property key
 * @param defaultValue Default value if property is null/undefined
 * @returns The property value or defaultValue
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined, 
  key: K, 
  defaultValue: T[K] | null = null
): T[K] | null {
  if (!obj) return defaultValue;
  return obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultValue;
}

// Use these safer functions in transformers as needed 