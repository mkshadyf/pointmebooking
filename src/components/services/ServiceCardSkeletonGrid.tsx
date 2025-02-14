import { Skeleton } from '@/components/ui/loading/Skeleton';

export function ServiceCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton variant="service" count={6} grid={true} />
    </div>
  );
}

export default ServiceCardSkeletonGrid;
