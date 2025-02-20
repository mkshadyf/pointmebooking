import { cn } from '@/lib/utils'; // Assuming you have a cn utility
import { forwardRef } from 'react';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 py-2', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent'; 