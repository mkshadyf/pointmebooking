'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent border-solid",
        {
          "h-4 w-4 border-2": size === 'sm',
          "h-8 w-8 border-2": size === 'md',
          "h-12 w-12 border-4": size === 'lg',
        },
        "border-primary",
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}; 