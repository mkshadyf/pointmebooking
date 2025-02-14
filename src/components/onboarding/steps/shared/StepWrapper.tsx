import { ReactNode } from 'react';

interface StepWrapperProps {
  children: ReactNode;
  title: string;
  description: string;
  isLoading?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}

export function StepWrapper({
  children,
  title,
  description,
  onSubmit
}: StepWrapperProps) {
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
          </form>
        </div>
      </div>
    </div>
  );
}
