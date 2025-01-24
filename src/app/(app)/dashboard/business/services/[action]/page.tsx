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

interface ManageServiceProps {
  params: { action: string };
}

export default function ManageService({ params }: ManageServiceProps) {
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
      if (isEdit && serviceId) {
        await updateService(serviceId, formData);
        toast.success('Service updated successfully!');
      } else {
        await addService(formData as Service);
        toast.success('Service created successfully!');
      }
      router.push('/dashboard/business/services');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Service' : 'Add New Service'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGroup>
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </FormGroup>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormGroup>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              required
            />
          </FormGroup>
        </div>

        <FormGroup>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            required
          >
            <option value="">Select a category</option>
            {serviceCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="is_available">Availability</Label>
          <div className="mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="is_available"
                className="form-checkbox h-4 w-4 text-primary"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              />
              <span className="ml-2">Service is currently available</span>
            </label>
          </div>
        </FormGroup>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/business/services')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </div>
  );
}
