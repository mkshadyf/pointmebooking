import { ApprovalStatus, Booking, Business, Category, ServiceStatus, UIService } from '@/types';
import { Database } from '@generated.types';

// Type aliases for better readability
type DbService = Database['public']['Tables']['services']['Row'];
type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbCategory = Database['public']['Tables']['service_categories']['Row'];
type DbBooking = Database['public']['Tables']['bookings']['Row'];
type DbBusiness = Database['public']['Tables']['businesses']['Row'];

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
   * @param includeRelations Optional related data (business, category)
   * @returns Fully typed UIService object
   */
  static transformService(
    serviceData: DbService | null | undefined, 
    includeRelations?: {
      business?: DbProfile | null | undefined;
      category?: DbCategory | null | undefined;
    }
  ): UIService | null {
    if (!serviceData) return null;

    try {
      // Transform business data if available
      const business = includeRelations?.business 
        ? this.transformBusinessData(includeRelations.business) 
        : undefined;
      
      // Transform category data if available
      const category = includeRelations?.category 
        ? this.transformCategoryData(includeRelations.category) 
        : undefined;

      // Create the service object with all required fields
      return {
        id: serviceData.id,
        business_id: serviceData.business_id,
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        duration: serviceData.duration,
        image_url: serviceData.image_url,
        is_available: serviceData.is_available === null ? true : serviceData.is_available,
        status: (serviceData.status as ServiceStatus) || 'active',
        category_id: serviceData.category_id,
        created_at: serviceData.created_at || new Date().toISOString(),
        updated_at: serviceData.updated_at || new Date().toISOString(),
        // Fields that might not be in the database schema
        max_capacity: (serviceData as any).max_capacity || 1,
        location: (serviceData as any).location || '',
        // Extended fields with fallbacks
        created_by_id: (serviceData as any).created_by_id || null,
        approved_by_id: (serviceData as any).approved_by_id || null,
        approved_at: (serviceData as any).approved_at || null,
        featured: Boolean((serviceData as any).featured),
        featured_order: (serviceData as any).featured_order || null,
        approval_status: ((serviceData as any).approval_status as ApprovalStatus) || 'pending',
        admin_notes: (serviceData as any).admin_notes || null,
        // Include related data if available
        business,
        category
      };
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
      // Use type assertion to handle properties that might not be in the database schema
      const profileWithExtras = profileData as any;
      
      return {
        id: profileData.id,
        name: profileWithExtras.business_name || profileData.full_name || '',
        description: profileWithExtras.description || '',
        address: profileWithExtras.address || '',
        city: profileWithExtras.city || '',
        state: profileWithExtras.state || '',
        phone: profileWithExtras.phone || profileWithExtras.contact_number || '',
        email: profileData.email || profileWithExtras.contact_email || '',
        logo_url: profileWithExtras.logo_url || profileData.avatar_url || ''
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
        icon: categoryData.icon ? String(categoryData.icon) : undefined
      };
    } catch (error) {
      console.error('Error transforming category data:', error);
      return undefined;
    }
  }

  /**
   * Transforms a joined service result into a UIService object
   * @param joinResult Joined service result from Supabase
   * @returns Fully typed UIService object
   */
  static transformJoinedServiceData(joinResult: any): UIService | null {
    if (!joinResult) return null;
    
    try {
      // Extract the main service data
      const serviceData = joinResult as DbService;
      
      // Extract related data
      const business = joinResult.business as DbProfile;
      const category = joinResult.category as DbCategory;
      
      // Use the main transformer with relations
      return this.transformService(serviceData, { business, category });
    } catch (error) {
      console.error('Error transforming joined service data:', error);
      return null;
    }
  }

  /**
   * Transforms a database business record with relations
   * @param businessData Database business record
   * @param includeRelations Optional related data
   * @returns Fully typed Business object with relations
   */
  static transformBusinessWithRelations(
    businessData: DbBusiness | null | undefined,
    includeRelations?: {
      owner?: DbProfile | null | undefined;
      services?: DbService[] | null | undefined;
      category?: DbCategory | null | undefined;
    }
  ): ExtendedBusiness | null {
    if (!businessData) return null;
    
    try {
      // Transform the basic business information
      const business: ExtendedBusiness = {
        id: businessData.id,
        name: businessData.name,
        description: businessData.description || undefined,
        address: businessData.address || undefined,
        city: businessData.city || undefined,
        state: businessData.state || undefined,
        phone: businessData.contact_number || undefined,
        email: businessData.contact_email || undefined,
        logo_url: businessData.logo_url || undefined
      };
      
      // Add owner information if available
      if (includeRelations?.owner) {
        business.owner = {
          id: includeRelations.owner.id,
          name: includeRelations.owner.full_name || '',
          email: includeRelations.owner.email
        };
      }
      
      // Add services if available
      if (includeRelations?.services && Array.isArray(includeRelations.services)) {
        business.services = includeRelations.services
          .map(service => this.transformService(service))
          .filter((service): service is UIService => Boolean(service)) as UIService[];
      }
      
      // Add category if available
      if (includeRelations?.category) {
        business.category = this.transformCategoryData(includeRelations.category);
      }
      
      return business;
    } catch (error) {
      console.error('Error transforming business with relations:', error);
      return null;
    }
  }

  /**
   * Transforms a database booking record into a Booking object
   * @param bookingData Database booking record
   * @returns Fully typed Booking object
   */
  static transformBooking(bookingData: DbBooking | null | undefined): Booking | null {
    if (!bookingData) return null;
    
    try {
      // Create a booking object with all required fields
      const booking: Partial<Booking> = {
        id: bookingData.id,
        customer_id: bookingData.customer_id,
        service_id: bookingData.service_id,
        business_id: bookingData.business_id,
        scheduled_at: bookingData.date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        status: bookingData.status,
        created_at: bookingData.created_at || new Date().toISOString(),
        updated_at: bookingData.updated_at || new Date().toISOString(),
        notes: bookingData.notes || undefined,
        customer_name: bookingData.customer_name || '',
        total_amount: bookingData.total_amount || 0
      };
      
      return booking as Booking;
    } catch (error) {
      console.error('Error transforming booking:', error);
      return null;
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
      // Use type assertion to handle properties that might not be in the database schema
      const businessWithExtras = businessData as any;
      
      return {
        id: businessData.id,
        name: businessData.name,
        description: businessData.description || '',
        address: businessData.address || '',
        city: businessData.city || '',
        state: businessData.state || '',
        phone: businessWithExtras.phone || businessData.contact_number || '',
        email: businessWithExtras.email || businessData.contact_email || '',
        logo_url: businessData.logo_url || businessData.avatar_url || ''
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
export const transformJoinedServiceData = EntityTransformer.transformJoinedServiceData.bind(EntityTransformer);

// Fix the toUIService function to use type assertions
export function toUIService(service: any): UIService {
  // Use type assertion to avoid property access errors
  // First cast to unknown, then to UIService to avoid type checking
  const result: UIService = {
    id: service.id,
    business_id: service.business_id,
    name: service.name,
    description: service.description,
    price: service.price,
    duration: service.duration,
    image_url: service.image_url,
    is_available: service.is_available,
    created_at: service.created_at || new Date().toISOString(),
    updated_at: service.updated_at || new Date().toISOString(),
    category_id: service.category_id,
    // Use optional chaining for nested properties
    category: service.category?.name || '',
    // Add missing properties with default values
    max_capacity: service.max_capacity || 1,
    location: service.location || '',
    // Add required properties from UIService interface
    status: service.status || 'active',
    created_by_id: service.created_by_id || null,
    approved_by_id: service.approved_by_id || null,
    approved_at: service.approved_at || null,
    featured: service.featured || false,
    featured_order: service.featured_order || null,
    approval_status: service.approval_status || 'pending',
    admin_notes: service.admin_notes || null,
    business: {
      id: service.business?.id || '',
      name: service.business?.name || '',
      logo_url: service.business?.avatar_url || ''
    }
  };
  
  return result;
}

// Fix the toUIBusiness function to use type assertions
export function toUIBusiness(profile: any): Business {
  // Use type assertion to avoid property access errors
  // First cast to unknown, then to Business to avoid type checking
  const result: Business = {
    id: profile.id,
    name: profile.business_name || profile.full_name || '',
    description: profile.description || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    phone: profile.phone || profile.contact_number || '',
    email: profile.email || profile.contact_email || '',
    logo_url: profile.logo_url || profile.avatar_url || ''
  };
  
  return result;
} 