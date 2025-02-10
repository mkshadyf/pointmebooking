'use client';

import { Navigation } from '@/components/navigation';
import { ServiceCard } from '@/components/services/ServiceCard';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { ServiceCardSkeletonGrid } from '@/components/ui/ServiceCardSkeleton';
import { searchServices } from '@/lib/services/search';
import { useAppStore } from '@/lib/store';
import { Service } from '@/types';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 9;

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const { categories } = useAppStore();
  const [, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Get initial search query and category from URL
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || null;
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await searchServices({
          query: searchQuery,
          category: selectedCategory || undefined,
        });
        setServices(results);
        setFilteredServices(results);
      } catch (err) {
        setError('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const paginatedServices = filteredServices.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paginatedServices.length < filteredServices.length;

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
              {loading ? (
                <ServiceCardSkeletonGrid />
              ) : error ? (
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setLoading(true);
                      searchServices({
                        query: searchQuery,
                        category: selectedCategory || undefined,
                      })
                        .then(results => {
                          setServices(results);
                          setFilteredServices(results);
                          setError(null);
                        })
                        .catch(() => setError('Failed to load services'))
                        .finally(() => setLoading(false));
                    }}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">No services found</h2>
                  <p className="text-gray-600">
                    Try adjusting your search or filters to find what you're looking for
                  </p>
                </div>
              ) : (
                <>
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
                    {paginatedServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-6 sm:mt-8 text-center">
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="inline-flex items-center px-4 sm:px-6 py-2 text-sm sm:text-base border border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                      >
                        Load More Services
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

