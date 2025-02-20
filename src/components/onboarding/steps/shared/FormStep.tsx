import { ReactNode } from 'react';

interface FormStepProps {
  title: string;
  description: string;
  isLoading?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

export function FormStep({
  title,
  description,
  isLoading = false,
  onSubmit,
  children
}: FormStepProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {description}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={onSubmit}>
            {children}
            <div className="flex justify-between pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {isLoading ? 'Loading...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 