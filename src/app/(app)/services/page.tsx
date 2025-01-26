'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ServiceCard } from '@/components/core/services/ServiceCard';
import { useAppStore } from '@/lib/store';
import { searchServices } from '@/lib/services/search';
import { Service } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const { categories } = useAppStore();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [duration, setDuration] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const results = await searchServices({
          query: searchQuery,
          category: selectedCategory || undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          duration,
        });
        setServices(results);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [searchQuery, selectedCategory, priceRange, duration]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Available Services
          </h1>
          <p className="mt-2 text-gray-600">
            Find and book the perfect service for your needs
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              type="search"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              Filters
            </Button>
          </div>

          <div className={`space-y-4 md:flex md:items-center md:gap-4 md:space-y-0 ${
            showFilters ? 'block' : 'hidden md:flex'
          }`}>
            <Select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full md:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              value={duration?.toString() || ''}
              onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full md:w-48"
            >
              <option value="">Any Duration</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </Select>

            <div className="w-full md:w-64">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onChange={(value) => setPriceRange(value as [number, number])}
              />
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : services.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-lg font-medium text-gray-900">No services found</p>
              <p className="mt-1 text-sm text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
