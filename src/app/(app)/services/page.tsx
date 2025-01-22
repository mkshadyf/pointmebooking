'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { PageLoading } from '@/components/ui/Loading';

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const { 
    serviceCategories, 
    categories, 
    setSelectedService, 
    fetchAllServices,
    isLoading,
    error 
  } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [duration, setDuration] = useState<string>('any');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllServices();
  }, [fetchAllServices]);

  // Filter services based on all criteria
  const filteredServices = serviceCategories
    .flatMap((cat) => cat.services)
    .filter((service) => {
      const matchesCategory = !selectedCategory || service.category_id === selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
      const matchesDuration = duration === 'any' || 
                            (duration === 'short' && service.duration <= 30) ||
                            (duration === 'medium' && service.duration > 30 && service.duration <= 60) ||
                            (duration === 'long' && service.duration > 60);
      
      return matchesCategory && matchesSearch && matchesPrice && matchesDuration;
    });

  if (isLoading) return <PageLoading />;

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Error loading services
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-96 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="any">Any duration</option>
                    <option value="short">Short (≤ 30 min)</option>
                    <option value="medium">Medium (31-60 min)</option>
                    <option value="long">Long ({'>'} 60 min)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="w-full md:w-64 flex-none">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    !selectedCategory
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Services
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
                >
                  {service.image_url && (
                    <div className="relative aspect-w-16 aspect-h-9 w-full h-48">
                      <Image
                        src={service.image_url}
                        alt={service.name}
                        fill
                        className="object-cover rounded-t-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      {/* Get category name from categories */}
                      {categories.find(c => c.id === service.category_id) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {categories.find(c => c.id === service.category_id)?.name}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-primary">
                          R{service.price}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.duration} minutes
                        </p>
                      </div>
                      <Link
                        href={`/services/${service.id}`}
                        onClick={() => setSelectedService(service)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No services found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
