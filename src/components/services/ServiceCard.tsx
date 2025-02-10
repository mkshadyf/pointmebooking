'use client';

import { Service } from '@/types';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface ServiceCardProps {
  service: Service;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

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

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    await router.push(`/services/${service.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-xl cursor-pointer"
    >
      <div className="relative h-48 w-full bg-gray-100">
        {service.image_url && !imageError ? (
          <>
            <Image
              src={service.image_url}
              alt={service.name}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
        <p className="mt-2 text-gray-600 line-clamp-2">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-purple-600">R{service.price}</span>
          {onEdit && (
            <button onClick={onEdit} className="text-blue-600 hover:underline">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-red-600 hover:underline">
              Delete
            </button>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <span>{service.duration} mins</span>
            <ArrowRightIcon className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </div>

      {isNavigating && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
} 