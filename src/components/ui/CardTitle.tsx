import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
    )
);
CardTitle.displayName = "CardTitle" 