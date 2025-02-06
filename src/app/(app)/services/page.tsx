'use client';

import MainNav from '@/components/navigation/MainNav';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { searchServices } from '@/lib/services/search';
import { useAppStore } from '@/lib/store';
import { Service } from '@/types';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Separate component for the services content that uses useSearchParams
function ServicesContent() {
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
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Available Services
        </h2>
        <p className="mt-2 text-gray-600">
          Find and book the perfect service for your needs
        </p>
      </div>

      <SearchFilter
        onSearch={setSearchQuery}
        categories={categories.map((category: { name: any; }) => category.name)}
        onCategorySelect={(category) => setSelectedCategory(category || null)}
      />

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            Filters
          </Button>
        </div>

        <div className={`space-y-4 md:flex md:items-center md:gap-4 md:space-y-0 ${
          showFilters ? 'block' : 'hidden md:flex'
        }`}>
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
              Price Range: R{priceRange[0]} - R{priceRange[1]}
            </label>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={priceRange}
              onValueChange={(value: number[]) => setPriceRange([value[0], value[1]])}
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
          <p className="text-xl font-medium text-gray-900">No services found</p>
          <p className="mt-1 text-sm text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            >
              {service.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={service.image_url}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{service.business?.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{service.duration} minutes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-bold text-gray-900">
                    R{service.price}
                  </p>
                  <div className="space-x-2">
                    <Link href={`/services/${service.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                    <Link href={`/services/${service.id}/book`}>
                      <Button size="sm">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
export default function ServicesPage() {
  return (
    <>
      <MainNav />
      <Suspense fallback={<LoadingSpinner />}>
        <ServicesContent />
      </Suspense>
    </>
  );
}
