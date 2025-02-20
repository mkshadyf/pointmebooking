import { StepButton } from '@/components/onboarding/steps/shared/StepButton';
import { StepInput } from '@/components/onboarding/steps/shared/StepInput';
import { useState } from 'react';

export interface AuthFormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export type AuthFormData = Record<string, string>;

interface AuthFormProps {
    fields: AuthFormField[];
    onSubmit: (data: AuthFormData) => Promise<void>;
    submitText: string;
    isLoading?: boolean;
    error?: string;
}

export function AuthForm({ fields, onSubmit, submitText, isLoading, error }: AuthFormProps) {
    const [formData, setFormData] = useState<AuthFormData>({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (id: string, value: string) => {
        setFormData((prev: AuthFormData) => ({ ...prev, [id]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => {
                if (field.type === 'select' && field.options) {
                    return (
                        <div key={field.name}>
                            <label
                                htmlFor={field.name}
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                {field.label}
                            </label>
                            <select
                                id={field.name}
                                name={field.name}
                                required={field.required}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                            >
                                {field.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                }

                return (
                    <StepInput
                        key={field.name}
                        id={field.name}
                        label={field.label}
                        type={field.type || 'text'}
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(value) => handleChange(field.name, value)}
                    />
                );
            })}

            {error && (
                <div className="text-sm text-red-600">{error}</div>
            )}

            <div>
                <StepButton type="submit" isLoading={isLoading}>
                    {submitText}
                </StepButton>
            </div>
        </form>
    );
} 