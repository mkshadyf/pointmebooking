import { Input } from '@/components/ui/Input';

interface AuthInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function AuthInput({
  id,
  label,
  type = 'text',
  required = false,
  value,
  onChange,
  error,
  placeholder
}: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <Input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={error ? 'border-red-500' : ''}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
} 