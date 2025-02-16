import { SearchService } from '@/lib/supabase/services/search.service';
import { ServiceService } from '@/lib/supabase/services/service.service';
import { handleClientError } from '@/lib/supabase/utils/errors';
import { BusinessCategory, BusinessProfile, Category, Service, ServiceCategory, ServiceStatus } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authSlice } from './slices/auth.slice';

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
  return {
    id: service.id,
    business_id: service.business_id,
    name: service.name,
    description: service.description,
    price: service.price,
    duration: service.duration,
    image_url: service.image_url,
    is_available: service.is_available,
    status: service.status as ServiceStatus,
    category_id: service.category_id,
    created_at: service.created_at,
    updated_at: service.updated_at,
    business: service.business ? {
      id: service.business.id,
      name: service.business.business_name || '',
      description: service.business.description,
      address: service.business.address,
      city: service.business.city,
      state: service.business.state,
      phone: service.business.phone,
      email: service.business.email,
      logo_url: service.business.logo_url,
    } : undefined,
    category: service.category ? {
      name: service.category.name,
      icon: service.category.icon,
    } : undefined,
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
          const newService = await ServiceService.create(service);
          if (newService) {
            set((state: StoreState) => ({ services: [...state.services, newService] }));
            return newService;
          }
          throw new Error('Failed to add service');
        } catch (error) {
          await handleClientError(error);
          throw error;
        }
      },

      updateService: async (id: string, updatedService: Partial<Service>) => {
        try {
          const updated = await ServiceService.update(id, updatedService);
          if (updated) {
            set((state: StoreState) => ({
              services: state.services.map((service: Service) =>
                service.id === id ? updated : service
              ),
            }));
            return updated;
          }
          throw new Error('Failed to update service');
        } catch (error) {
          await handleClientError(error);
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
          set({ services });
          return services;
        } catch (error) {
          await handleClientError(error);
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
