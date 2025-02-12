import * as serviceApi from '@/lib/api/services';
import { handleClientError } from '@/lib/errors/handlers';
import { BusinessCategory, BusinessProfile, Category, Service, ServiceCategory } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistMiddleware, errorBoundary, logger, performanceTracker } from './middleware';
import { createAuthSlice, type AuthSlice } from './slices/auth.slice';

interface AppState {
  categories: Category[];
  businessCategories: BusinessCategory[];
  serviceCategories: ServiceCategory[];
  services: Service[];
  selectedBusiness: BusinessProfile | null;
  selectedService: Service | null;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
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

interface StoreState extends AuthSlice {}

// Create store with middleware
const createStore = () => {
  return create<StoreState>()(
    errorBoundary(
      performanceTracker(
        logger(
          createPersistMiddleware('app-store', 1)((...a) => ({
            ...createAuthSlice(...a),
          })),
          'AppStore'
        )
      )
    )
  );
};

export const useStore = createStore();

// Selector hooks for better performance
export const useAuth = () => useStore((state) => ({
  user: state.user,
  loading: state.loading,
  error: state.error,
  initialized: state.initialized,
  login: state.login,
  register: state.register,
  logout: state.logout,
  updateProfile: state.updateProfile,
  clearError: state.clearError,
  setUser: state.setUser,
}));

// Export types
export type { StoreState };

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: '1', name: 'Beauty & Wellness', description: 'Beauty and wellness services', icon: '💆‍♀️', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', name: 'Health & Fitness', description: 'Health and fitness services', icon: '💪', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '3', name: 'Home Services', description: 'Home maintenance and repair', icon: '🏠', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '4', name: 'Professional Services', description: 'Professional and business services', icon: '💼', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ],
      businessCategories: [],
      serviceCategories: [],
      services: [],
      selectedBusiness: null,
      selectedService: null,
      selectedCategory: null,
      isLoading: false,
      error: null,

      setSelectedBusiness: (business: BusinessProfile | null) => set({ selectedBusiness: business }),
      setSelectedService: (service: Service | null) => set({ selectedService: service }),
      setSelectedCategory: (id: string | null) => set({ selectedCategory: id }),
      setServices: (services: Service[]) => set({ services }),
      
      fetchAllServices: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/services');
          if (!response.ok) throw new Error('Failed to fetch services');
          
          const services = await response.json();
          
          // Group services by category
          const servicesByCategory = services.reduce((acc: ServiceCategory[], service: Service) => {
            const category = get().categories.find((c: Category) => c.id === service.category_id);
            if (!category) return acc;
            
            const existingCategory = acc.find(c => c.id === service.category_id);
            if (existingCategory) {
              existingCategory.services.push(service);
            } else {
              acc.push({
                id: category.id,
                name: category.name,
                description: category.description ?? 'No description available',
                icon: category.icon ?? '📋',
                services: [service],
              });
            }
            return acc;
          }, []);
          
          set({ serviceCategories: servicesByCategory });
        } catch (error) {
          await handleClientError(error);
          set({ error: 'Failed to fetch services' });
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

      fetchFeaturedServices: async () => {
        try {
          const services = await serviceApi.getFeaturedServices();
          set({ services });
        } catch (error) {
          await handleClientError(error);
        }
      },

      addService: async (service: Service) => {
        try {
          const newService = await serviceApi.createService(service);
          if (newService) {
            set((state: AppState) => ({ services: [...state.services, newService] }));
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
          const updated = await serviceApi.updateService(id, updatedService);
          if (updated) {
            set((state: AppState) => ({
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
          const success = await serviceApi.deleteService(id);
          if (success) {
            set((state: AppState) => ({
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
          const services = await serviceApi.getServicesByBusiness(businessId);
          set({ services });
          return services;
        } catch (error) {
          await handleClientError(error);
          throw error;
        }
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        selectedBusiness: state.selectedBusiness,
        selectedService: state.selectedService,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);
