'use client';

import { BaseCard } from '@/components/ui/shared/BaseCard';
import { Service } from '@/types';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ServiceCardProps {
  service: Service;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  minimal?: boolean;
}

export function ServiceCard({ 
  }: ServiceCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const businessAddress = service.business ? 
    [service.business.address, service.business.city, service.business.state]
      .filter(Boolean)
      .join(', ') : 
    'Address not available';

  const handleClick = async () => {
    if (isNavigating || !service.id) return;
    setIsNavigating(true);
    await router.push(`/services/${service.id}`);
  };

  return (
    <BaseCard
      title={service.name}
      description={service.description || undefined}
      imageUrl={service.image_url}
      logoUrl={service.business?.logo_url || null}
      minimal={minimal}
      onClick={!showActions ? handleClick : undefined}
    >
      {!minimal && (
        <>
          {service.business && (
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{businessAddress}</span>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">
              ${service.price.toFixed(2)}
            </div>
            {showActions ? (
              <div className="flex space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(service.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(service.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleClick}
                disabled={isNavigating}
                className="flex items-center text-purple-600 hover:text-purple-800"
              >
                View Details →
              </button>
            )}
          </div>
        </>
      )}
    </BaseCard>
  );
} 