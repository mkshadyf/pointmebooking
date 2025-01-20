import { create } from 'zustand';
import { BusinessProfile, Category, Service, BusinessCategory, ServiceCategory } from '@/types';

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
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  categories: [
    { id: '1', name: 'Beauty & Wellness', description: 'Beauty and wellness services', icon: '💆‍♀️' },
    { id: '2', name: 'Health & Fitness', description: 'Health and fitness services', icon: '💪' },
    { id: '3', name: 'Home Services', description: 'Home maintenance and repair', icon: '🏠' },
    { id: '4', name: 'Professional Services', description: 'Professional and business services', icon: '💼' },
  ],
  businessCategories: [
    {
      id: '1',
      name: 'Beauty & Wellness',
      description: 'Beauty and wellness services',
      icon: '💆‍♀️',
      businesses: [
        {
          id: 'b1',
          email: 'spa@example.com',
          role: 'business',
          full_name: 'Serenity Spa',
          business_name: 'Serenity Spa & Wellness',
          business_category: 'Beauty & Wellness',
          description: 'Luxury spa treatments and wellness services',
          location: '123 Relaxation Ave',
          contact_number: '+1234567890',
          working_hours: { start: '09:00', end: '18:00' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          services: [],
        },
        {
          id: 'b2',
          email: 'salon@example.com',
          role: 'business',
          full_name: 'Glamour Studio',
          business_name: 'Glamour Beauty Studio',
          business_category: 'Beauty & Wellness',
          description: 'Premium beauty treatments and styling',
          location: '456 Beauty Blvd',
          contact_number: '+1234567891',
          working_hours: { start: '10:00', end: '19:00' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          services: [],
        },
      ],
    },
    // Add more business categories as needed
  ],
  serviceCategories: [
    {
      id: 'cat1',
      name: 'Beauty & Wellness',
      description: 'Beauty and wellness services',
      icon: 'spa',
      services: [],
    },
    {
      id: 'cat2',
      name: 'Health & Fitness',
      description: 'Health and fitness services',
      icon: 'fitness',
      services: [],
    },
    {
      id: 'cat3',
      name: 'Professional Services',
      description: 'Professional and business services',
      icon: 'business',
      services: [],
    },
  ],
  selectedBusiness: null,
  selectedService: null,
  selectedCategory: null,
  setSelectedBusiness: (business) => set({ selectedBusiness: business }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedCategory: (id) => set({ selectedCategory: id }),
  addService: (service) =>
    set((state) => ({
      serviceCategories: state.serviceCategories.map((cat) =>
        cat.id === service.category_id
          ? { ...cat, services: [...cat.services, service] }
          : cat
      ),
    })),
  updateService: (id, updatedService) =>
    set((state) => ({
      serviceCategories: state.serviceCategories.map((cat) => ({
        ...cat,
        services: cat.services.map((service) =>
          service.id === id ? { ...service, ...updatedService } : service
        ),
      })),
    })),
  deleteService: (id) =>
    set((state) => ({
      serviceCategories: state.serviceCategories.map((cat) => ({
        ...cat,
        services: cat.services.filter((service) => service.id !== id),
      })),
    })),
}));
