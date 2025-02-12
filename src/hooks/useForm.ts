'use client';

import { useCallback, useState } from 'react';
import { z } from 'zod';

type ValidationSchema = z.ZodType<any, any>;

interface UseFormProps<T extends Record<string, any>> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  // Validate a single field
  const validateField = useCallback(
    async (name: keyof T, value: any): Promise<string | undefined> => {
      if (!validationSchema) return undefined;

      try {
        await validationSchema.parseAsync({ [name]: value });
        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(err => err.path[0] === name);
          return fieldError?.message;
        }
        return 'Validation error';
      }
    },
    [validationSchema]
  );

  // Validate all fields
  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!validationSchema) return true;

    try {
      await validationSchema.parseAsync(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  // Handle field change
  const handleChange = useCallback(
    async (name: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [name]: value }));
      setTouched(prev => ({ ...prev, [name]: true }));
      
      const error = await validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    },
    [validateField]
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isValid = await validateForm();
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    validateField,
    validateForm,
  };
} 