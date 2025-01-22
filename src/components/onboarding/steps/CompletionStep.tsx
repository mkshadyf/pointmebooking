'use client';

import { BusinessProfile } from '@/types';

export interface CompletionStepProps {
  initialData: BusinessProfile | null;
  onNextAction: (data: Partial<BusinessProfile>) => Promise<void>;
  onBackAction?: () => void;
}

export default function CompletionStep({
  initialData,
  onNextAction,
  onBackAction,
}: CompletionStepProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNextAction({ onboarding_completed: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Setup Complete!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your business profile has been set up successfully. You can now start
          managing your bookings and services.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Business Details
        </h3>
        <dl className="divide-y divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Business Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {initialData?.business_name}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {initialData?.business_category}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Contact</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {initialData?.contact_number}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {initialData?.location}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Services</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {initialData?.services?.length || 0} services added
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex justify-between">
        {onBackAction && (
          <button
            type="button"
            onClick={onBackAction}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Complete Setup
        </button>
      </div>
    </form>
  );
}
