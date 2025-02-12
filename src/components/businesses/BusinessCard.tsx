'use client';

import { BaseCard } from '@/components/ui/shared/BaseCard';
import { BusinessProfile } from '@/types';
import { MapPinIcon, PhoneIcon, StarIcon } from '@heroicons/react/24/outline';

interface BusinessCardProps {
  business: BusinessProfile;
  minimal?: boolean;
}

export function BusinessCard({ business, minimal = false }: BusinessCardProps) {
  return (
    <BaseCard
      href={`/businesses/${business.id}`}
      title={business.business_name}
      description={business.description}
      imageUrl={business.cover_image_url || null}
      logoUrl={business.logo_url || null}
      minimal={minimal}
    >
      {!minimal && (
        <>
          <div className="mt-4 space-y-2">
            {business.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="mr-2 h-4 w-4 text-gray-400" />
                <span>{business.location}</span>
              </div>
            )}
            {business.contact_number && (
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="mr-2 h-4 w-4 text-gray-400" />
                <span>{business.contact_number}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-sm font-medium text-gray-600">4.5</span>
              <span className="mx-1 text-sm text-gray-400">/</span>
              <span className="text-sm text-gray-400">(123)</span>
            </div>
            <span className="text-sm text-purple-600 group-hover:text-purple-700">View Details →</span>
          </div>
        </>
      )}
    </BaseCard>
  );
} 