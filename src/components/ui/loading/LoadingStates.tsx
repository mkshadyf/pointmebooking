import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingStateProps {
  variant?: 'page' | 'inline' | 'overlay' | 'skeleton';
  className?: string;
  text?: string;
}

export function LoadingState({ 
  variant = 'inline',
  className,
  text
}: LoadingStateProps) {
  switch (variant) {
    case 'page':
      return (
        <div className={cn(
          'flex h-[50vh] items-center justify-center',
          className
        )}>
          <div className="text-center">
            <LoadingSpinner size="lg" variant="circular" />
            {text && <p className="mt-4 text-gray-600">{text}</p>}
          </div>
        </div>
      );

    case 'overlay':
      return (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-white/80',
          className
        )}>
          <LoadingSpinner size="lg" />
          {text && <p className="ml-2 text-gray-600">{text}</p>}
        </div>
      );

    case 'skeleton':
      return (
        <div className={cn('animate-pulse space-y-4', className)}>
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      );

    default:
      return (
        <div className={cn('flex items-center justify-center p-4', className)}>
          <LoadingSpinner size="md" />
          {text && <p className="ml-2 text-gray-600">{text}</p>}
        </div>
      );
  }
} 