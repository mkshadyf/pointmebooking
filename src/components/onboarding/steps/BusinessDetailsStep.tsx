'use client';

import { useState } from 'react';
import { BusinessProfile } from '@/types';

export interface BusinessDetailsStepProps {
  initialData: BusinessProfile | null;
  onNextAction: (data: Partial<BusinessProfile>) => Promise<void>;
  onBackAction?: () => void;
}

export function BusinessDetailsStep({
  initialData,
  onNextAction,
  onBackAction,
}: BusinessDetailsStepProps) {
  const [formData, setFormData] = useState({
    business_name: initialData?.business_name || '',
    business_type: initialData?.business_type || '',
    business_category: initialData?.business_category || '',
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNextAction(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tell us about your business
        </h2>
        <p className="text-gray-600 mb-8">
          This information will be displayed to your customers.
        </p>
      </div>

      <div>
        <label
          htmlFor="business_name"
          className="block text-sm font-medium text-gray-700"
        >
          Business Name
        </label>
        <input
          type="text"
          id="business_name"
          name="business_name"
          required
          value={formData.business_name}
          onChange={(e) =>
            setFormData({ ...formData, business_name: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="business_type"
          className="block text-sm font-medium text-gray-700"
        >
          Business Type
        </label>
        <input
          type="text"
          id="business_type"
          name="business_type"
          required
          value={formData.business_type}
          onChange={(e) =>
            setFormData({ ...formData, business_type: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="business_category"
          className="block text-sm font-medium text-gray-700"
        >
          Business Category
        </label>
        <input
          type="text"
          id="business_category"
          name="business_category"
          required
          value={formData.business_category}
          onChange={(e) =>
            setFormData({ ...formData, business_category: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
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
          Next
        </button>
      </div>
    </form>
  );
}
