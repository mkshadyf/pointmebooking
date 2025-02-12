import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'title' | 'image' | 'avatar' | 'button' | 'card' | 'service' | 'business';
  count?: number;
  grid?: boolean;
  gridCols?: string;
}

export function Skeleton({
  className,
  variant = 'text',
  count = 1,
  grid = false,
  gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  ...props
}: SkeletonProps) {
  const getSkeletonContent = () => {
    switch (variant) {
      case 'title':
        return <div className={cn('h-6 w-3/4 rounded-md bg-gray-200', className)} {...props} />;
      
      case 'image':
        return <div className={cn('h-48 w-full rounded-md bg-gray-200', className)} {...props} />;
      
      case 'avatar':
        return <div className={cn('h-12 w-12 rounded-full bg-gray-200', className)} {...props} />;
      
      case 'button':
        return <div className={cn('h-10 w-20 rounded-md bg-gray-200', className)} {...props} />;
      
      case 'service':
        return (
          <div className="group relative overflow-hidden rounded-lg bg-white shadow-md animate-pulse">
            <div className="relative h-48 w-full bg-gray-200" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        );
      
      case 'business':
        return (
          <div className="group relative overflow-hidden rounded-lg bg-white shadow-md">
            <div className="relative h-48 w-full bg-gray-200" />
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        );
      
      default: // text
        return <div className={cn('h-4 w-full rounded-md bg-gray-200', className)} {...props} />;
    }
  };

  const skeletonItem = getSkeletonContent();

  if (count === 1) return skeletonItem;

  const items = Array.from({ length: count }, (_, i) => (
    <div key={i}>{skeletonItem}</div>
  ));

  return grid ? (
    <div className={cn('grid gap-6', gridCols)}>{items}</div>
  ) : (
    <>{items}</>
  );
} 