'use client';

import { useState, useEffect } from 'react';
import { ServiceCard } from '@/components/core/services/ServiceCard';
import { useAppStore } from '@/lib/store';
import { searchServices } from '@/lib/services/search';
import { Service } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ServicesGridProps {
  initialCategory?: string;
}

export function ServicesGrid({ initialCategory }: ServicesGridProps) {
  const { categories } = useAppStore();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value || null);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDuration(e.target.value ? Number(e.target.value) : undefined);
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchChange}
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
            onChange={handleCategoryChange}
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
            onChange={handleDurationChange}
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
              onValueChange={handlePriceRangeChange}
            />
          </div>
        </div>
      </div>

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
    </div>
  );
}
