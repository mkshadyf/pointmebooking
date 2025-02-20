import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 py-2', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader'; 