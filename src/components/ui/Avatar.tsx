'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
};

export function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  const [error, setError] = useState(false);
  const fallbackSrc = '/images/placeholder/avatar.jpg';

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeMap[size]} ${className}`}>
      <Image
        src={error ? fallbackSrc : (src || fallbackSrc)}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
} 