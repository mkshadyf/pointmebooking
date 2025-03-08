'use client';

import { handleClientError } from '@/lib/error/error-handler';
import { searchService } from '@/lib/supabase/services/search/search.service';
import { ServiceServiceStatic as ServiceService } from '@/lib/supabase/services/service/service.service';
import { BusinessCategory, BusinessProfile, Category, ServiceCategory, ServiceStatus, UIService } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Remove the import of authSlice to avoid circular dependency
// import { authSlice } from './auth.store';

// Export auth store directly
export { authActions, useAuthStore } from './auth.store';

// Base state without actions
interface BaseState {
  categories: Category[];
  businessCategories: BusinessCategory[];
  serviceCategories: ServiceCategory[];
  services: UIService[];
  selectedBusiness: BusinessProfile | null;
  selectedService: UIService | null;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
}

// Actions as a separate interface
interface Actions {
  setSelectedBusiness: (business: BusinessProfile | null) => void;
  setSelectedService: (service: UIService | null) => void;
  setSelectedCategory: (id: string | null) => void;
  setServices: (services: UIService[]) => void;
  addService: (service: UIService) => Promise<UIService>;
  updateService: (id: string, service: Partial<UIService>) => Promise<UIService>;
  deleteService: (id: string) => Promise<void>;
  loadServices: (businessId: string) => Promise<UIService[]>;
  fetchAllServices: () => Promise<void>;
  fetchAllBusinesses: () => Promise<void>;
  fetchFeaturedServices: () => Promise<void>;
}

// Combined store state type
export type StoreState = BaseState & Actions;

// Transform database service to UI service
function transformServiceData(dbService: any): UIService {
  return {
    id: dbService.id,
    business_id: dbService.business_id,
    name: dbService.name,
    description: dbService.description,
    price: dbService.price,
    duration: dbService.duration,
    image_url: dbService.image_url,
    max_capacity: dbService.max_capacity,
    location: dbService.location,
    is_available: dbService.is_available === null ? true : dbService.is_available,
    created_at: dbService.created_at || '',
    updated_at: dbService.updated_at || '',
    status: dbService.status as ServiceStatus,
    category_id: dbService.category_id,
    created_by_id: dbService.created_by_id || null,
    approved_by_id: dbService.approved_by_id || null,
    approved_at: dbService.approved_at || null,
    featured: Boolean(dbService.featured),
    featured_order: dbService.featured_order || null,
    approval_status: dbService.approval_status || 'pending',
    admin_notes: dbService.admin_notes || null,
    business: dbService.business,
    category: dbService.category
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
          const services = await searchService.getFeaturedServices();
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

      addService: async (service: UIService): Promise<UIService> => {
        try {
          // Map UI service to database service
          const serviceInsert = {
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            business_id: service.business_id,
            category_id: service.category_id,
            image_url: service.image_url,
            // Convert 'draft' or 'archived' to 'inactive' to match the database schema
            status: (service.status === 'draft' || service.status === 'archived') ? 'inactive' : service.status,
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

      updateService: async (id: string, service: Partial<UIService>) => {
        try {
          // Map UI service to database service
          const serviceUpdate = {
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            category_id: service.category_id,
            image_url: service.image_url,
            // Convert 'draft' or 'archived' to 'inactive' to match the database schema
            status: service.status ? 
              ((service.status === 'draft' || service.status === 'archived') ? 'inactive' : service.status) 
              : undefined,
            is_available: service.is_available
          };
          
          const updated = await ServiceService.update(id, serviceUpdate);
          if (updated) {
            const transformedService = transformServiceData(updated);
            set((state: StoreState) => ({
              services: state.services.map((service: UIService) =>
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
              services: state.services.filter((service: UIService) => service.id !== id),
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

