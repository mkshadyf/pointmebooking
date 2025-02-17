'use client';

import Image from 'next/image';
import { useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export interface AvatarImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export interface AvatarFallbackProps {
  children?: React.ReactNode;
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
};

export function Avatar({ size = 'md', className = '', children }: AvatarProps) {
  return (
    <div className={`relative rounded-full overflow-hidden ${sizeMap[size]} ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = '', className = '' }: AvatarImageProps) {
  const [error, setError] = useState(false);
  const fallbackSrc = '/images/placeholder/avatar.jpg';

  return (
    <Image
      src={error ? fallbackSrc : (src || fallbackSrc)}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}

export function AvatarFallback({ children, className = '' }: AvatarFallbackProps) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
      {children}
    </div>
  );
} 