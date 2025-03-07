import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, fullWidth = true, inputSize = 'md', size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
          {
            'h-8 text-xs': inputSize === 'sm',
            'h-10': inputSize === 'md',
            'h-12 text-base px-4': inputSize === 'lg',
            'w-full': fullWidth
          },
          className
        )}
        size={size}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };

