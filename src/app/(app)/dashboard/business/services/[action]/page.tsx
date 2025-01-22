'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import {
  Input,
  TextArea,
  Label,
  FormGroup,
  Button,
} from '@/components/ui/form';
import * as serviceApi from '@/lib/api/services';
import { Service } from '@/types';

export default function ManageService({
  params,
}: {
  params: { action: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const { addService, updateService, serviceCategories } = useAppStore();
  const [loading, setLoading] = useState(false);

  const isEdit = params.action === 'edit';
  const serviceId = searchParams.get('id');

  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category_id: '',
    is_available: true,
    business_id: profile?.id || '',
  });

  useEffect(() => {
    async function loadService() {
      if (isEdit && serviceId) {
        try {
          const service = await serviceApi.getServiceById(serviceId);
          setFormData(service);
        } catch (error) {
          const err = error as Error;
          toast.error('Failed to load service: ' + err.message);
          router.push('/dashboard/business/services');
        }
      }
    }

    loadService();
  }, [isEdit, serviceId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData: Service = {
        id: isEdit ? serviceId! : `service_${Date.now()}`,
        business_id: profile?.id || '',
        name: formData.name || '',
        description: formData.description || '',
        price: Number(formData.price) || 0,
        duration: Number(formData.duration) || 30,
        category_id: formData.category_id || '',
        is_available: formData.is_available ?? true,
        created_at: isEdit ? (formData.created_at || new Date().toISOString()) : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isEdit && serviceId) {
        await updateService(serviceId, serviceData);
        toast.success('Service updated successfully');
      } else {
        await addService(serviceData);
        toast.success('Service added successfully');
      }
      router.push('/dashboard/business/services');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save service');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Service' : 'Add New Service'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isEdit
            ? 'Update your service details'
            : 'Add a new service to your business'}
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <FormGroup>
            <Label htmlFor="name">Service Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter service name"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              rows={4}
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your service"
            />
          </FormGroup>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormGroup>
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                id="price"
                name="price"
                required
                fullWidth
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                placeholder="Enter price"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                type="number"
                id="duration"
                name="duration"
                required
                fullWidth
                min="0"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
                placeholder="Enter duration in minutes"
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
            >
              <option value="">Select a category</option>
              {serviceCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormGroup>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={(e) =>
                setFormData({ ...formData, is_available: e.target.checked })
              }
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <Label htmlFor="is_available" className="ml-2">
              Service is available for booking
            </Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/business/services')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
