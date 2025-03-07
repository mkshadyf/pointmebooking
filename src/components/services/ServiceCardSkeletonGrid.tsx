import { Skeleton } from '@/components/ui/loading/Skeleton';

export const ServiceCardSkeletonGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="rounded-lg bg-white shadow-sm overflow-hidden border border-gray-200">
          <Skeleton className="h-48 w-full bg-gray-200" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-1/2 bg-gray-200" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/4 bg-gray-200" />
              <Skeleton className="h-4 w-1/4 bg-gray-200" />
            </div>
            <Skeleton className="h-8 w-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceCardSkeletonGrid;
