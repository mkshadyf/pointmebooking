import { SearchService } from '@/lib/supabase/services/search.service';
import { ServiceService } from '@/lib/supabase/services/service.service';
import { handleClientError } from '@/lib/supabase/utils/errors';
import { BusinessCategory, BusinessProfile, Category, Service, ServiceCategory, ServiceStatus } from '@/types';
import { Database } from '@generated.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authSlice } from './slices/auth.slice';

// Type definitions from database
type DbService = Database['public']['Tables']['services']['Row'];
type DbServiceStatus = Database['public']['Enums']['service_status'];
type DbApprovalStatus = 'pending' | 'approved' | 'rejected';

// Base state without actions
interface BaseState {
  categories: Category[];
  businessCategories: BusinessCategory[];
  serviceCategories: ServiceCategory[];
  services: Service[];
  selectedBusiness: BusinessProfile | null;
  selectedService: Service | null;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
}

// Actions as a separate interface
interface Actions {
  setSelectedBusiness: (business: BusinessProfile | null) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedCategory: (id: string | null) => void;
  setServices: (services: Service[]) => void;
  addService: (service: Service) => Promise<Service>;
  updateService: (id: string, service: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
  loadServices: (businessId: string) => Promise<Service[]>;
  fetchAllServices: () => Promise<void>;
  fetchAllBusinesses: () => Promise<void>;
  fetchFeaturedServices: () => Promise<void>;
}

// Combined store state type
export type StoreState = BaseState & Actions;

// Helper function to transform service data
function transformServiceData(service: any): Service {
  // Handle database service fields with type safety
  const dbService: Partial<DbService> = {
    id: service.id,
    business_id: service.business_id,
    name: service.name,
    description: service.description,
    price: service.price,
    duration: service.duration,
    image_url: service.image_url,
    is_available: service.is_available,
    status: service.status as DbServiceStatus,
    category_id: service.category_id,
    created_at: service.created_at,
    updated_at: service.updated_at,
  };

  // Business details with type safety
  const business = service.business ? {
    id: service.business.id || '',
    name: service.business.business_name || '',
    description: service.business.description,
    address: service.business.address,
    city: service.business.city,
    state: service.business.state,
    phone: service.business.phone,
    email: service.business.email,
    logo_url: service.business.logo_url,
  } : undefined;

  // Category with type safety
  const category = service.category ? {
    id: service.category.id || '',
    name: service.category.name,
    icon: service.category.icon,
  } : undefined;

  // Return complete Service object with all required fields
  return {
    ...dbService,
    id: dbService.id || '',
    business_id: dbService.business_id || '',
    name: dbService.name || '',
    description: dbService.description || null,
    price: dbService.price || 0,
    duration: dbService.duration || 0,
    image_url: dbService.image_url || null,
    is_available: dbService.is_available || null,
    status: dbService.status as ServiceStatus || 'active',
    category_id: dbService.category_id || null,
    created_at: dbService.created_at || null,
    updated_at: dbService.updated_at || null,
    // Additional fields required by Service type
    created_by_id: service.created_by_id || null,
    approved_by_id: service.approved_by_id || null,
    approved_at: service.approved_at || null,
    featured: service.featured || false,
    featured_order: service.featured_order || null,
    approval_status: (service.approval_status as DbApprovalStatus) || 'pending',
    admin_notes: service.admin_notes || null,
    business,
    category,
  };
}

// Create the store
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Initial state
      categories: [],
      businessCategories: [],
      serviceCategories: [],
      services: [],
      selectedBusiness: null,
      selectedService: null,
      selectedCategory: null,
      isLoading: false,
      error: null,

      // Actions
      setSelectedBusiness: (business) => set({ selectedBusiness: business }),
      setSelectedService: (service) => set({ selectedService: service }),
      setSelectedCategory: (id) => set({ selectedCategory: id }),
      setServices: (services) => set({ services }),

      fetchAllServices: async () => {
        set({ isLoading: true, error: null });
        try {
          const services = await ServiceService.getAll();
          const typedServices = services.map(transformServiceData);
          set({ services: typedServices });
        } catch (error) {
          await handleClientError(error);
          set({ error: 'Failed to fetch services' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchFeaturedServices: async () => {
        set({ isLoading: true, error: null });
        try {
          const services = await SearchService.getFeaturedServices();
          if (!services) {
            throw new Error('No services returned');
          }
          const typedServices = services.map(transformServiceData);
          set({ services: typedServices });
        } catch (error) {
          console.error('Store error fetching services:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch services' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAllBusinesses: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/businesses');
          if (!response.ok) throw new Error('Failed to fetch businesses');
          
          const businesses = await response.json();
          
          // Group businesses by category
          const businessesByCategory = businesses.reduce((acc: BusinessCategory[], business: BusinessProfile) => {
            if (!business.business_category) return acc;
            
            const existingCategory = acc.find((c: BusinessCategory) => c.id === business.business_category);
            if (existingCategory) {
              existingCategory.businesses.push(business);
            } else {
              acc.push({
                id: business.business_category,
                name: business.business_category,
                businesses: [business],
              });
            }
            return acc;
          }, []);
          
          set({ businessCategories: businessesByCategory });
        } catch (error) {
          await handleClientError(error);
          set({ error: 'Failed to fetch businesses' });
        } finally {
          set({ isLoading: false });
        }
      },

      addService: async (service: Service) => {
        try {
          // Convert the Service type to ServiceInsert type
          const serviceInsert = {
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            business_id: service.business_id,
            category_id: service.category_id,
            image_url: service.image_url,
            status: service.status,
            is_available: service.is_available
          };
          
          const newService = await ServiceService.create(serviceInsert);
          if (newService) {
            const transformedService = transformServiceData(newService);
            set((state: StoreState) => ({ services: [...state.services, transformedService] }));
            return transformedService;
          }
          throw new Error('Failed to add service');
        } catch (error) {
          await handleClientError(error);
          set({ error: 'Failed to add service' });
          throw error;
        }
      },

      updateService: async (id: string, updatedService: Partial<Service>) => {
        try {
          // Convert the Partial<Service> type to ServiceUpdate type
          const serviceUpdate = {
            name: updatedService.name,
            description: updatedService.description,
            price: updatedService.price,
            duration: updatedService.duration,
            category_id: updatedService.category_id,
            image_url: updatedService.image_url,
            status: updatedService.status,
            is_available: updatedService.is_available
          };
          
          const updated = await ServiceService.update(id, serviceUpdate);
          if (updated) {
            const transformedService = transformServiceData(updated);
            set((state: StoreState) => ({
              services: state.services.map((service: Service) =>
                service.id === id ? transformedService : service
              ),
            }));
            return transformedService;
          }
          throw new Error('Failed to update service');
        } catch (error) {
          await handleClientError(error);
          set({ error: 'Failed to update service' });
          throw error;
        }
      },

      deleteService: async (id: string) => {
        try {
          const success = await ServiceService.delete(id);
          if (success) {
            set((state: StoreState) => ({
              services: state.services.filter((service: Service) => service.id !== id),
            }));
          } else {
            throw new Error('Failed to delete service');
          }
        } catch (error) {
          await handleClientError(error);
          throw error;
        }
      },

      loadServices: async (businessId: string) => {
        try {
          const services = await ServiceService.getByBusiness(businessId);
          const transformedServices = services.map(transformServiceData);
          set({ services: transformedServices });
          return transformedServices;
        } catch (error) {
          await handleClientError(error);
          set({ error: 'Failed to load services' });
          throw error;
        }
      },
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        selectedBusiness: state.selectedBusiness,
        selectedService: state.selectedService,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);

// Create auth store separately
export const useAuthStore = create(authSlice);
