'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/TextArea';
import { BusinessCategory, BusinessOnboardingData } from '@/types/business';
import { useEffect, useState } from 'react';

interface BusinessBasicInfoFormProps {
  data: Partial<BusinessOnboardingData>;
  updateData: (data: Partial<BusinessOnboardingData>) => void;
  categories: BusinessCategory[];
  onNext: () => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

export default function BusinessBasicInfoForm({
  data,
  updateData,
  categories,
  onNext,
  errors,
  setErrors
}: BusinessBasicInfoFormProps) {
  const [formData, setFormData] = useState({
    businessName: data.businessName || '',
    description: data.description || '',
    businessCategoryId: data.businessCategoryId || '',
  });
  
  // Set initial form data when the component mounts or data changes
  useEffect(() => {
    setFormData({
      businessName: data.businessName || '',
      description: data.description || '',
      businessCategoryId: data.businessCategoryId || '',
    });
  }, [data]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.businessCategoryId) {
      newErrors.businessCategoryId = 'Business category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateData(formData);
      onNext();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Business Information</h2>
      <p className="text-gray-500">Tell us about your business</p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input 
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Enter your business name"
            className={errors.businessName ? 'border-red-500' : ''}
          />
          {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
        </div>
        
        <div>
          <Label htmlFor="businessCategoryId">Business Category *</Label>
          <Select 
            value={formData.businessCategoryId} 
            onValueChange={(value) => handleSelectChange('businessCategoryId', value)}
          >
            <SelectTrigger className={errors.businessCategoryId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a category">
                {formData.businessCategoryId ? categories.find(cat => cat.id === formData.businessCategoryId)?.name : ''}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessCategoryId && <p className="text-red-500 text-sm mt-1">{errors.businessCategoryId}</p>}
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your business"
            rows={4}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
} 