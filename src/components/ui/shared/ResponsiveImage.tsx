import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface ResponsiveImageProps {
  src: string | null;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  showLoadingIndicator?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder/default.jpg',
  className,
  containerClassName,
  fill = true,
  width,
  height,
  priority = false,
  showLoadingIndicator = true,
  showRetry = true,
  onRetry,
  ...props
}: ResponsiveImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    onRetry?.();
  };

  const imageSrc = error ? fallbackSrc : (src || fallbackSrc);

  return (
    <div className={cn('relative', containerClassName)}>
      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      
      {loading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <span className="mb-2 text-sm">Failed to load image</span>
          {showRetry && (
            <button
              onClick={handleRetry}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
} 