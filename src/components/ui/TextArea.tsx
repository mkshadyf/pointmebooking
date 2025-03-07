'use client';

import { forwardRef } from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

// Export with both casings to support existing imports
export const Textarea = TextArea;
