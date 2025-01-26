'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/form';
import { toast } from 'react-hot-toast';
import { Service } from '@/types';
import { ServiceCard } from '@/components/core/services/ServiceCard';
import router from 'next/router';

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
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => router.push(`/dashboard/business/services/edit?id=${service.id}`)}
              onDelete={() => handleDelete(service.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
