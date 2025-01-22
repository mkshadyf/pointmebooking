import clsx from 'clsx';
import { forwardRef } from 'react';

// Common styles
const baseInputStyles = 'block w-full border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all duration-200 ease-in-out';
const errorStyles = 'ring-red-300 focus:ring-red-500';
const disabledStyles = 'bg-gray-50 text-gray-500 cursor-not-allowed';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, fullWidth, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          baseInputStyles,
          error && errorStyles,
          disabled && disabledStyles,
          fullWidth ? 'w-full' : 'w-auto',
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, fullWidth, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          baseInputStyles,
          error && errorStyles,
          disabled && disabledStyles,
          fullWidth ? 'w-full' : 'w-auto',
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'TextArea';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, fullWidth, disabled, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clsx(
          baseInputStyles,
          error && errorStyles,
          disabled && disabledStyles,
          fullWidth ? 'w-full' : 'w-auto',
          'bg-white',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export const Checkbox = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={clsx(
          'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors duration-200 ease-in-out',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export const Label = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={clsx(
        'block text-sm font-medium leading-6 text-gray-900',
        className
      )}
      {...props}
    />
  );
});
Label.displayName = 'Label';

export const FormGroup = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('space-y-2', className)}
      {...props}
    />
  );
});
FormGroup.displayName = 'FormGroup';

export const ErrorMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="mt-1 text-sm text-red-500">
      {children}
    </p>
  );
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
  }
>(({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'border border-transparent text-white bg-primary hover:bg-primary/90 focus:ring-primary':
            variant === 'primary',
          'border border-transparent text-primary bg-primary/10 hover:bg-primary/20 focus:ring-primary':
            variant === 'secondary',
          'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary':
            variant === 'outline',
          'border border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500':
            variant === 'danger',
          'px-3 py-2 text-sm rounded-lg': size === 'sm',
          'px-4 py-2.5 text-sm rounded-lg': size === 'md',
          'px-6 py-3 text-base rounded-lg': size === 'lg',
          'w-full': fullWidth,
        },
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
