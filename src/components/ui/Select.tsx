import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) onChange(e);
      if (onValueChange) onValueChange(e.target.value);
    };

    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export interface SelectContentProps {
  children: React.ReactNode;
}

export const SelectContent = ({ children }: SelectContentProps) => {
  return <>{children}</>;
};

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export const SelectItem = ({ value, children }: SelectItemProps) => {
  return <option value={value}>{children}</option>;
};

export interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  return <div className={className}>{children}</div>;
};

export interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
}

export const SelectValue = ({ children, placeholder }: SelectValueProps) => {
  return <>{children || placeholder}</>;
};
