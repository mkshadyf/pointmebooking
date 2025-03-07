'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/TextArea';
import { ServiceCategory } from '@/types/database/business';
import { useState } from 'react';

interface BusinessServicesFormProps {
  initialData?: {
    services?: Array<{
      id?: string;
      name: string;
      description?: string;
      price: number;
      duration: number;
      categoryId?: string;
    }>;
  };
  serviceCategories: ServiceCategory[];
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export default function BusinessServicesForm({ 
  initialData = {}, 
  serviceCategories = [],
  onSubmit, 
  onBack 
}: BusinessServicesFormProps) {
  const [services, setServices] = useState(initialData.services || []);
  const [currentService, setCurrentService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    categoryId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAddingService, setIsAddingService] = useState(false);

  const validateService = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentService.name) {
      newErrors.name = 'Service name is required';
    }
    
    if (currentService.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (currentService.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = () => {
    if (!validateService()) return;
    
    setServices([...services, { ...currentService }]);
    setCurrentService({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      categoryId: '',
    });
    setIsAddingService(false);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({ 
      ...prev, 
      [name]: name === 'price' || name === 'duration' ? parseFloat(value) || 0 : value 
    }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentService((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (services.length === 0) {
      setErrors({ services: 'Please add at least one service' });
      return;
    }
    
    onSubmit({ services });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Services</h2>
      <p className="text-gray-500">Add the services you offer to customers</p>
      
      {services.length > 0 ? (
        <div className="space-y-4">
          {services.map((service, index) => (
            <Card key={index} className="p-4 relative">
              <button
                type="button"
                onClick={() => handleRemoveService(index)}
                className="absolute top-2 right-2 text-red-500"
              >
                Remove
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">{service.name}</p>
                  <p className="text-sm text-gray-500">{service.description || 'No description'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${service.price}</p>
                  <p className="text-sm text-gray-500">{service.duration} minutes</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-gray-500">No services added yet</p>
        </div>
      )}
      
      {errors.services && <p className="text-sm text-red-500">{errors.services}</p>}
      
      {isAddingService ? (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-4">Add New Service</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Service Name *
              </label>
              <Input
                id="name"
                name="name"
                value={currentService.name}
                onChange={handleChange}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                name="description"
                value={currentService.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($) *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentService.price || ''}
                  onChange={handleChange}
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes) *
                </label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="5"
                  step="5"
                  value={currentService.duration || ''}
                  onChange={handleChange}
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && <p className="mt-1 text-sm text-red-500">{errors.duration}</p>}
              </div>
            </div>
            
            {serviceCategories.length > 0 && (
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Category (Optional)
                </label>
                <Select
                  value={currentService.categoryId}
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category">
                      {currentService.categoryId ? serviceCategories.find(cat => cat.id === currentService.categoryId)?.name : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAddingService(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddService}>
                Add Service
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button type="button" onClick={() => setIsAddingService(true)}>
          Add New Service
        </Button>
      )}
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
} 