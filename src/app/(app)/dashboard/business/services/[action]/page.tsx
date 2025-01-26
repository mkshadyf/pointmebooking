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
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import * as serviceApi from '@/lib/api/services';
import { Service } from '@/types';
import { uploadImage } from '@/lib/services/storage';

interface PageProps {
  params: { action: string };
}

export default function ServiceActionPage({ params }: PageProps) {
  const { action } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { categories } = useAppStore();
  const serviceId = searchParams.get('id');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category_id: '',
    image_url: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (action === 'edit' && serviceId) {
      const fetchService = async () => {
        try {
          const service = await serviceApi.getService(serviceId);
          if (service) {
            setFormData({
              name: service.name,
              description: service.description,
              price: service.price.toString(),
              duration: service.duration.toString(),
              category_id: service.category_id,
              image_url: service.image_url || ''
            });
          }
        } catch (error) {
          console.error('Error fetching service:', error);
          toast.error('Failed to load service details');
        }
      };

      fetchService();
    }
  }, [action, serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const serviceData = {
        business_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category_id: formData.category_id,
        image_url: formData.image_url,
        status: 'active',
        is_available: true
      } as const satisfies Omit<Service, 'id' | 'created_at' | 'updated_at'>;

      if (action === 'edit' && serviceId) {
        await serviceApi.updateService(serviceId, serviceData);
        toast.success('Service updated successfully');
      } else {
        await serviceApi.createService(serviceData);
        toast.success('Service created successfully');
      }

      router.push('/dashboard/business/services');
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file, 'service-images', `service-${serviceId}`);
    if (url) {
      setFormData((prev) => ({ ...prev, image_url: url }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {action === 'edit' ? 'Edit Service' : 'Create Service'}
          </h1>

          <FormGroup>
            <Label htmlFor="image">Service Image</Label>
            <ImageUpload
              initialUrl={formData.image_url}
              onChange={handleImageUpload}
              maxSize={5}
              aspectRatio={16 / 9}
              className="mt-4"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              required
            />
          </FormGroup>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormGroup>
              <Label htmlFor="price">Price (R)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
                required
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={formData.category_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category_id: e.target.value }))
              }
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormGroup>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : action === 'edit' ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
