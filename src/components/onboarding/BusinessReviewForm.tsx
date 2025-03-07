'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';

interface BusinessReviewFormProps {
  initialData?: Record<string, any>;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export default function BusinessReviewForm({ initialData = {}, onSubmit, onBack }: BusinessReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(initialData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Your Information</h2>
      <p className="text-gray-500">Please review your business information before submitting</p>
      
      <div className="space-y-6">
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Business Name</p>
              <p>{initialData.businessName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Type</p>
              <p>{initialData.businessType || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p>{initialData.businessCategoryName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p>{initialData.description || 'Not provided'}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{initialData.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{initialData.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <p>{initialData.website || 'Not provided'}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p>{initialData.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p>{initialData.city || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State</p>
              <p>{initialData.state || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ZIP Code</p>
              <p>{initialData.zipCode || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p>{initialData.country || 'Not provided'}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Media</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Logo</p>
              {initialData.logoUrl ? (
                <img 
                  src={initialData.logoUrl} 
                  alt="Business Logo" 
                  className="w-20 h-20 object-cover rounded-md mt-2" 
                />
              ) : (
                <p>Not provided</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Cover Image</p>
              {initialData.coverImageUrl ? (
                <img 
                  src={initialData.coverImageUrl} 
                  alt="Cover Image" 
                  className="w-full h-20 object-cover rounded-md mt-2" 
                />
              ) : (
                <p>Not provided</p>
              )}
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Services</h3>
          {initialData.services && initialData.services.length > 0 ? (
            <ul className="list-disc pl-5">
              {initialData.services.map((service: any, index: number) => (
                <li key={index}>
                  {service.name} - ${service.price} ({service.duration} min)
                </li>
              ))}
            </ul>
          ) : (
            <p>No services added</p>
          )}
        </Card>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Business Profile'}
        </Button>
      </div>
    </div>
  );
} 