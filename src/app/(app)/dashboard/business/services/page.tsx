'use client';

import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { PencilIcon, TrashIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import clsx from 'clsx';

export default function BusinessServices() {
  const { user } = useAuth();
  const { serviceCategories, deleteService } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get services for this business
  const businessServices = serviceCategories
    .flatMap((cat) => 
      cat.services.map(service => ({
        ...service,
        category_name: cat.name,
      }))
    )
    .filter((service) => service.business_id === user?.id);

  const filteredServices = selectedCategory
    ? businessServices.filter((service) => service.category_id === selectedCategory)
    : businessServices;

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setLoading(serviceId);
    try {
      deleteService(serviceId);
      toast.success('Service deleted successfully');
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to delete service: ' + error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your business services.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/business/services/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Add New Service
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium',
              selectedCategory === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            All
          </button>
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium',
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {filteredServices.map((service) => (
            <li key={service.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                      {service.description}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <Link
                      href={`/dashboard/business/services/${service.id}/edit`}
                      className="mr-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      disabled={loading === service.id}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex space-x-6">
                    <p className="flex items-center text-sm text-gray-500">
                      <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      ${service.price}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {service.duration} minutes
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      {service.category_name}
                    </p>
                    <span
                      className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        service.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {service.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No services yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by adding services to your business profile.
          </p>
          <Link
            href="/dashboard/business/services/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
          >
            Add Service
          </Link>
        </div>
      )}
    </div>
  );
}
