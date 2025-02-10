'use client';

import { useEffect, useState } from 'react';

export function ServiceCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-48 w-full bg-gray-200" />
      
      <div className="p-6">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        
        {/* Price and duration skeleton */}
        <div className="mt-4 flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function ServiceCardSkeletonGrid() {
  const [showSkeletons, setShowSkeletons] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSkeletons(false);
    }, 5000); // Stop showing skeletons after 5 seconds

    return () => clearTimeout(timeout);
  }, []);

  if (!showSkeletons) {
    return null; // Or return a fallback UI
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  );
} 