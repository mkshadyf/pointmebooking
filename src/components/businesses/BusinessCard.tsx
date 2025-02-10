'use client';

import { BusinessProfile } from '@/types';
import { MapPinIcon, PhoneIcon, StarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface BusinessCardProps {
  business: BusinessProfile;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageRetry = () => {
    setImageError(false);
    setImageLoading(true);
  };

  return (
    <Link
      href={`/businesses/${business.id}`}
      className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-xl"
    >
      <div className="relative h-48 w-full bg-gray-100">
        {business.cover_image_url && !imageError ? (
          <>
            <Image
              src={business.cover_image_url}
              alt={business.business_name || ''}
              fill
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            {imageError ? (
              <>
                <span className="mb-2 text-sm">Failed to load image</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleImageRetry();
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Retry
                </button>
              </>
            ) : (
              <span className="text-sm">No image available</span>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{business.business_name}</h3>
            <p className="mt-1 text-sm text-gray-600">{business.business_category}</p>
          </div>
          {business.logo_url && (
            <div className="relative h-12 w-12 flex-shrink-0">
              <Image
                src={business.logo_url}
                alt={`${business.business_name} logo`}
                fill
                className="rounded-full object-cover"
              />
            </div>
          )}
        </div>

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
      </div>
    </Link>
  );
} 