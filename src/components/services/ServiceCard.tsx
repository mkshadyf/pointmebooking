'use client';

import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { getImageUrl } from '@/lib/utils/image';
import { UIService } from '@/types';
import Image from 'next/image';
import { memo } from 'react';

interface ServiceCardProps {
  service: UIService;
  minimal?: boolean;
}

// Component implementation wrapped with memo for performance optimization
export const ServiceCard = memo(function ServiceCard({ service }: ServiceCardProps) {
  const { name, description, price, duration, image_url, business } = service;
  const imageUrl = getImageUrl(image_url, 'services');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full bg-gray-200">
        {image_url ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJEAPYrnHY4QAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex justify-between items-center">
          <div className="font-medium text-primary">{formatCurrency(price)}</div>
          <div className="text-sm text-gray-500">{duration} min</div>
        </div>
        
        {business && (
          <div className="mt-4 flex items-center border-t pt-4">
            {business.logo_url ? (
              <Image
                src={getImageUrl(business.logo_url, 'business')}
                alt={business.name}
                width={32}
                height={32}
                className="rounded-full"
                loading="lazy"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                {business.name.charAt(0)}
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{business.name}</p>
              {business.city && (
                <p className="text-xs text-gray-500">{business.city}</p>
              )}
            </div>
          </div>
        )}
        
        <button 
          className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
          aria-label={`Book ${name}`}
        >
          Book Now
        </button>
      </div>
    </Card>
  );
}); 