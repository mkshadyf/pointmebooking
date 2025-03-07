'use client';

import { Navigation } from '@/components/navigation';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceCardSkeletonGrid } from '@/components/services/ServiceCardSkeletonGrid';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { useAuth } from '@/hooks/auth/useAuth';
import { ServiceWithRelations } from '@/lib/supabase';
import { searchService } from '@/lib/supabase/services';
import { useStore } from '@/lib/supabase/store/store';
import { SERVICE_STATUSES, ServiceStatus, UIService } from '@/types';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 9;

function assertServiceStatus(status: string): ServiceStatus {
  return SERVICE_STATUSES.includes(status as ServiceStatus)
    ? (status as ServiceStatus)
    : 'active';
}

function mapServiceWithRelationsToService(dbService: any): UIService {
  if (!dbService) {
    console.error('Invalid service data received:', dbService);
    throw new Error('Invalid service data');
  }
  
  const { business, category, status, ...serviceData } = dbService;
  
  return {
    ...serviceData,
    status: assertServiceStatus(status || 'active'),
    business: business ? {
      id: business.id,
      name: business.business_name || '',
      description: business.description || undefined,
      address: business.address || undefined,
      city: business.city || undefined,
      state: business.state || undefined,
      phone: business.phone || undefined,
      email: business.email || undefined,
      logo_url: business.logo_url || undefined,
    } : undefined,
    category: category ? {
      name: category.name,
      icon: category.icon || undefined,
    } : undefined,
  } as UIService;
}

export default function ServicesPage() {
  const { isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const { categories, fetchCategories, isLoading: categoriesLoading } = useStore();
  const [services, setServices] = useState<UIService[]>([]);
  const [filteredServices, setFilteredServices] = useState<UIService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [, setTotalPages] = useState(1);

  // Get initial search query and category from URL
  const initialQuery = searchParams?.get('q') || '';
  const initialCategory = searchParams?.get('category') || null;
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().catch((error) => {
        console.error('Error loading categories:', error);
      });
    }
  }, [categories.length, fetchCategories]);

  // Load services when search params change or on initial load
  useEffect(() => {
    // Skip if auth or categories are still loading
    if (authLoading || categoriesLoading) {
      return;
    }

    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        );
        
        const fetchPromise = searchService.searchServices(searchQuery || '', {
          category: selectedCategory || undefined,
          page,
          limit: ITEMS_PER_PAGE
        });
        
        // Race between fetch and timeout
        const results = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        if (!results || !results.data) {
          throw new Error('No results returned from search');
        }
        
        const mappedServices = results.data
          .map((service: any) => {
            try {
              return mapServiceWithRelationsToService(service);
            } catch (err) {
              console.error('Error mapping service:', err, service);
              return null;
            }
          })
          .filter(Boolean) as UIService[];
        
        setServices(mappedServices);
        setFilteredServices(mappedServices);
      } catch (err) {
        console.error('Error loading services:', err);
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          setError('Network error: Unable to reach the server. Please check your internet connection or try again later.');
        } else if (err instanceof Error && err.message === 'Request timed out') {
          setError('The request took too long to complete. Please try again later.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load services');
        }
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [searchQuery, selectedCategory, page, authLoading, categoriesLoading]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const hasMore = services.length >= page * ITEMS_PER_PAGE;

  // Show loading state while initializing
  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation type="main" />
        <main className="pt-16 sm:pt-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="mb-4 text-center text-gray-600">
              {authLoading ? 'Initializing...' : 'Loading categories...'}
            </div>
            <ServiceCardSkeletonGrid />
          </div>
        </main>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation type="main" />
        <main className="pt-16 sm:pt-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetchCategories().then(() => {
                    searchService.searchServices(searchQuery || '', {
                      category: selectedCategory || undefined,
                      page,
                      limit: ITEMS_PER_PAGE
                    })
                      .then((results: any) => {
                        setServices(
                          results.data
                            .filter((service: any) => service !== null)
                            .map((service: ServiceWithRelations) => {
                              return mapServiceWithRelationsToService(service);
                            })
                        );
                        // Use pagination data if available
                        if (results.pagination) {
                          setTotalPages(results.pagination.totalPages || 1);
                        }
                        setLoading(false);
                      })
                      .catch((err: Error) => {
                        console.error('Error fetching services:', err);
                        setError('Failed to load services. Please try again.');
                        setLoading(false);
                      });
                  });
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state while fetching services
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation type="main" />
        <main className="pt-16 sm:pt-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="mb-4 text-center text-gray-600">
              Loading services...
            </div>
            <ServiceCardSkeletonGrid />
          </div>
        </main>
      </div>
    );
  }

  // Show empty state if no services
  if (filteredServices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation type="main" />
        <main className="pt-16 sm:pt-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">No services found</h2>
              <p className="text-gray-600">
                Try adjusting your search or filters to find what you're looking for
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show main content
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation type="main" />
      <main className="pt-16 sm:pt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Search and Filter Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Browse Services</h1>
              <div className="w-full sm:w-96">
                <SearchFilter
                  onSearch={handleSearch}
                  categories={categories.map(cat => cat.name)}
                  onCategorySelect={handleCategorySelect}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="relative flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar - Mobile Drawer */}
            <aside 
              className={`
                fixed inset-0 lg:relative lg:inset-auto lg:block lg:w-64
                transform transition-transform duration-200 ease-in-out z-40
                ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${showFilters ? 'pt-16 sm:pt-20' : ''} lg:pt-0 
              `}
            >
              {/* Mobile Overlay */}
              <div 
                className={`fixed inset-0 bg-black bg-opacity-50 lg:hidden ${showFilters ? 'block' : 'hidden'}`}
                onClick={() => setShowFilters(false)}
              />

              {/* Filter Content */}
              <div className="relative h-full lg:h-auto bg-white shadow-xl lg:shadow-sm lg:rounded-lg">
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-8rem)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                    >
                      <span className="sr-only">Close filters</span>
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Categories */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                      <div className="space-y-3">
                        {categories.map(category => (
                          <label key={category.id} className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              checked={selectedCategory === category.name}
                              onChange={() => handleCategorySelect(selectedCategory === category.name ? null : category.name)}
                            />
                            <span className="ml-3 text-sm text-gray-600">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Min</label>
                          <input type="number" className="w-full px-3 py-1 text-sm border rounded-md" placeholder="0" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Max</label>
                          <input type="number" className="w-full px-3 py-1 text-sm border rounded-md" placeholder="1000+" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="fixed bottom-4 right-4 lg:hidden bg-purple-600 text-white p-3 rounded-full shadow-lg z-30"
              aria-label="Toggle filters"
            >
              <FunnelIcon className="h-6 w-6" />
            </button>

            {/* Services Grid */}
            <div className="flex-1 min-w-0">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-sm font-medium text-gray-500">
                  {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                  <select className="w-full sm:w-auto text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500">
                    <option>Most Relevant</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    minimal={false}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-sm font-medium text-purple-600 bg-white border border-purple-300 rounded-md hover:bg-purple-50"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

