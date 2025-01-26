'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceCard } from '@/components/core/services/ServiceCard';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Service } from '@/types';
import { useAppStore } from '@/lib/store';

const dummyServices: Service[] = [
  {
    id: '1',
    business_id: '1',
    name: 'Professional Haircut',
    description: 'Get a stylish haircut from our experienced stylists',
    price: 30,
    duration: 30,
    image_url: '/images/services/haircut.jpg',
    category_id: '1',
    status: 'active',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    business_id: '1',
    name: 'Relaxing Massage',
    description: 'Unwind with our therapeutic massage service',
    price: 60,
    duration: 60,
    image_url: '/images/services/massage.jpg',
    category_id: '2',
    status: 'active',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    business_id: '1',
    name: 'Facial Treatment',
    description: 'Rejuvenate your skin with our premium facial',
    price: 45,
    duration: 45,
    image_url: '/images/services/facial.jpg',
    category_id: '3',
    status: 'active',
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function ServiceSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { services, fetchFeaturedServices } = useAppStore();
  const displayServices = services.length > 0 ? services : dummyServices;

  const filteredServices = displayServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchFeaturedServices();
  }, [fetchFeaturedServices]);

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredServices.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered, filteredServices.length]);

  return (
    <div className="w-full px-4 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:text-3xl">
          Featured Services
        </h2>

        <SearchFilter onSearch={setSearchQuery} />

        <div 
          className="relative mx-auto max-w-md overflow-hidden md:max-w-2xl lg:max-w-4xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <ServiceCard service={filteredServices[currentIndex]} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex justify-center gap-2">
            {filteredServices.map((_: Service, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
