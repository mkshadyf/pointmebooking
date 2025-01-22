'use client';

import { useState } from 'react';
import { BusinessProfile, Service } from '@/types';
  
export interface StepProps {
  initialData: BusinessProfile | null;
  onNextAction: (data: Partial<BusinessProfile>) => Promise<void>;
  onBackAction?: () => void;
}

const defaultService: Service = {
  id: '',
  name: '',
  description: '',
  price: 0,
  duration: 0,
  category_id: '',
  is_available: true,
  business_id: '',
  created_at: '',
  updated_at: '',
};

export function ServicesStep({ initialData, onNextAction, onBackAction }: StepProps) {
  const defaultServiceWithBusinessId: Service = {
    ...defaultService,
    business_id: initialData?.id || '',
  };

  const [services, setServices] = useState<Service[]>(
    initialData?.services || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNextAction({
      services,
      onboarding_completed: true,
    });
  };

  const addService = () => {
    const newId = Math.random().toString(36).substring(2, 15);
    setServices([...services, { ...defaultServiceWithBusinessId, id: newId }]);
  };

  const updateService = (index: number, data: Partial<Service>) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], ...data };
    setServices(updatedServices);
  };

  const removeService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {services.map((service, index) => (
        <div key={service.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Service {index + 1}</h3>
            <button
              type="button"
              onClick={() => removeService(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>

          <div>
            <label htmlFor={`service-name-${index}`} className="block text-sm font-medium text-gray-700">
              Service Name
            </label>
            <input
              type="text"
              id={`service-name-${index}`}
              required
              value={service.name}
              onChange={(e) => updateService(index, { name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor={`service-description-${index}`} className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id={`service-description-${index}`}
              required
              value={service.description}
              onChange={(e) => updateService(index, { description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor={`service-price-${index}`} className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              id={`service-price-${index}`}
              required
              min="0"
              step="0.01"
              value={service.price}
              onChange={(e) => updateService(index, { price: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor={`service-duration-${index}`} className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              id={`service-duration-${index}`}
              required
              min="0"
              step="15"
              value={service.duration}
              onChange={(e) => updateService(index, { duration: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor={`service-category-${index}`} className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              id={`service-category-${index}`}
              required
              value={service.category_id}
              onChange={(e) => updateService(index, { category_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id={`service-available-${index}`}
              checked={service.is_available}
              onChange={(e) => updateService(index, { is_available: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor={`service-available-${index}`} className="ml-2 block text-sm text-gray-900">
              Available
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addService}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Add Service
      </button>

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
