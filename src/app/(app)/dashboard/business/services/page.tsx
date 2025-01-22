'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/form';
import { toast } from 'react-hot-toast';
import { Service } from '@/types';

export default function BusinessServices() {
  const { profile } = useAuth();
  const { loadServices, deleteService } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function fetchServices() {
      if (profile?.id) {
        try {
          const data = await loadServices(profile.id);
          setServices(data || []);
        } catch (error) {
          const err = error as Error;
          toast.error('Failed to load services: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchServices();
  }, [profile?.id, loadServices]);

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
        setServices(services.filter(s => s.id !== serviceId));
        toast.success('Service deleted successfully');
      } catch (error) {
        const err = error as Error;
        toast.error('Failed to delete service: ' + err.message);
      }
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your service offerings
          </p>
        </div>
        <Link href="/dashboard/business/services/add" passHref>
          <Button>Add Service</Button>
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No services added yet.</p>
            <Link href="/dashboard/business/services/add" passHref>
              <Button className="mt-4">Add Your First Service</Button>
            </Link>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="p-6 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {service.description}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Duration: {service.duration} minutes • Price: ${service.price}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.is_available ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/business/services/edit?id=${service.id}`}
                      className="text-primary hover:text-primary/80"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
