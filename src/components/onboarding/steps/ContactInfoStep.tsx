'use client';

import { BusinessProfile } from '@/types';
import { useState } from 'react';
import { FormStep } from './shared/FormStep';

export interface ContactInfoStepProps {
  initialData: BusinessProfile | null;
  onNextAction: (data: Partial<BusinessProfile>) => Promise<void>;
  onBackAction?: () => void;
}

export function ContactInfoStep({
  initialData,
  onNextAction,
  onBackAction,
}: ContactInfoStepProps) {
  const [formData, setFormData] = useState({
    contact_number: initialData?.contact_number || '',
    location: initialData?.location || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    contact_email: initialData?.contact_email || '',
    website: initialData?.website || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNextAction(formData);
  };

  return (
    <FormStep
      title="Contact Information"
      description="Provide your business contact details"
      onSubmit={handleSubmit}
    >
      <div>
        <label
          htmlFor="contact_number"
          className="block text-sm font-medium text-gray-700"
        >
          Contact Number
        </label>
        <input
          type="tel"
          id="contact_number"
          name="contact_number"
          required
          value={formData.contact_number}
          onChange={(e) =>
            setFormData({ ...formData, contact_number: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Street Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          required
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            required
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="postal_code"
            className="block text-sm font-medium text-gray-700"
          >
            Postal Code
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            required
            value={formData.postal_code}
            onChange={(e) =>
              setFormData({ ...formData, postal_code: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact_email"
          className="block text-sm font-medium text-gray-700"
        >
          Contact Email
        </label>
        <input
          type="email"
          id="contact_email"
          name="contact_email"
          required
          value={formData.contact_email}
          onChange={(e) =>
            setFormData({ ...formData, contact_email: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="website"
          className="block text-sm font-medium text-gray-700"
        >
          Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
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
      </div>
    </FormStep>
  );
}
