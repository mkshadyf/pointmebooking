'use client';

import { Loader2 } from 'lucide-react';

export const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-3 mt-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export const PageLoading = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

export const InlineLoading = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);
