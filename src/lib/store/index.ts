import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BusinessProfile, Category, Service, BusinessCategory, ServiceCategory } from '@/types';
import * as serviceApi from '@/lib/api/services';

interface AppState {
  categories: Category[];
  businessCategories: BusinessCategory[];
  serviceCategories: ServiceCategory[];
  selectedBusiness: BusinessProfile | null;
  selectedService: Service | null;
  selectedCategory: string | null;
  setSelectedBusiness: (business: BusinessProfile | null) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedCategory: (id: string | null) => void;
  addService: (service: Service) => Promise<Service>;
  updateService: (id: string, service: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
  loadServices: (businessId: string) => Promise<Service[]>;
  fetchAllServices: () => Promise<void>;
  fetchAllBusinesses: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: '1', name: 'Beauty & Wellness', description: 'Beauty and wellness services', icon: '💆‍♀️' },
        { id: '2', name: 'Health & Fitness', description: 'Health and fitness services', icon: '💪' },
        { id: '3', name: 'Home Services', description: 'Home maintenance and repair', icon: '🏠' },
        { id: '4', name: 'Professional Services', description: 'Professional and business services', icon: '💼' },
      ],
      businessCategories: [],
      serviceCategories: [],
      selectedBusiness: null,
      selectedService: null,
      selectedCategory: null,
      isLoading: false,
      error: null,

      setSelectedBusiness: (business) => set({ selectedBusiness: business }),
      setSelectedService: (service) => set({ selectedService: service }),
      setSelectedCategory: (id) => set({ selectedCategory: id }),
      
      fetchAllServices: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/services');
          if (!response.ok) throw new Error('Failed to fetch services');
          
          const services = await response.json();
          
          // Group services by category
          const servicesByCategory = services.reduce((acc: ServiceCategory[], service: Service) => {
            const category = get().categories.find(c => c.id === service.category_id);
            if (!category) return acc;
            
            const existingCategory = acc.find(c => c.id === service.category_id);
            if (existingCategory) {
              existingCategory.services.push(service);
            } else {
              acc.push({
                id: category.id,
                name: category.name,
                description: category.description,
                icon: category.icon,
                services: [service],
              });
            }
            return acc;
          }, []);
          
          set({ serviceCategories: servicesByCategory });
        } catch (error) {
          console.error('Error fetching services:', error);
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
            
            const existingCategory = acc.find(c => c.id === business.business_category);
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
          console.error('Error fetching businesses:', error);
          set({ error: 'Failed to fetch businesses' });
        } finally {
          set({ isLoading: false });
        }
      },

      addService: async (service) => {
        const newService = await serviceApi.createService(service);
        set((state) => ({
          serviceCategories: state.serviceCategories.map((cat) =>
            cat.id === service.category_id
              ? { ...cat, services: [...cat.services, newService] }
              : cat
          ),
        }));
        return newService;
      },

      updateService: async (id, updatedService) => {
        const updated = await serviceApi.updateService(id, updatedService);
        set((state) => ({
          serviceCategories: state.serviceCategories.map((cat) => ({
            ...cat,
            services: cat.services.map((service) =>
              service.id === id ? { ...service, ...updated } : service
            ),
          })),
        }));
        return updated;
      },

      deleteService: async (id) => {
        await serviceApi.deleteService(id);
        set((state) => ({
          serviceCategories: state.serviceCategories.map((cat) => ({
            ...cat,
            services: cat.services.filter((service) => service.id !== id),
          })),
        }));
      },

      loadServices: async (businessId) => {
        const services = await serviceApi.getServicesByBusiness(businessId);
        return services;
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
