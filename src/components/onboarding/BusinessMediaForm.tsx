'use client';

import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useState } from 'react';

interface BusinessMediaFormProps {
  initialData?: {
    logoUrl?: string;
    coverImageUrl?: string;
    galleryImages?: string[];
  };
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export default function BusinessMediaForm({ initialData = {}, onSubmit, onBack }: BusinessMediaFormProps) {
  const [formData, setFormData] = useState({
    logoUrl: initialData.logoUrl || '',
    coverImageUrl: initialData.coverImageUrl || '',
    galleryImages: initialData.galleryImages || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogoUpload = (file: File) => {
    // In a real implementation, you would upload the file to a server
    // and get back a URL. For now, we'll create an object URL.
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, logoUrl: url }));
    if (errors.logoUrl) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.logoUrl;
        return newErrors;
      });
    }
  };

  const handleCoverImageUpload = (file: File) => {
    // In a real implementation, you would upload the file to a server
    // and get back a URL. For now, we'll create an object URL.
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, coverImageUrl: url }));
    if (errors.coverImageUrl) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.coverImageUrl;
        return newErrors;
      });
    }
  };

  const handleGalleryImageUpload = (file: File) => {
    // In a real implementation, you would upload the file to a server
    // and get back a URL. For now, we'll create an object URL.
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, url],
    }));
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.logoUrl) {
      newErrors.logoUrl = 'Business logo is required';
    }
    
    if (!formData.coverImageUrl) {
      newErrors.coverImageUrl = 'Cover image is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Business Media</h2>
      <p className="text-gray-500">Upload images for your business profile</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Logo *
          </label>
          <ImageUpload
            initialUrl={formData.logoUrl}
            onChange={handleLogoUpload}
            className={errors.logoUrl ? 'border-red-500' : ''}
          />
          {errors.logoUrl && <p className="mt-1 text-sm text-red-500">{errors.logoUrl}</p>}
          <p className="mt-1 text-sm text-gray-500">
            Upload a square logo image (recommended size: 400x400px)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image *
          </label>
          <ImageUpload
            initialUrl={formData.coverImageUrl}
            onChange={handleCoverImageUpload}
            className={errors.coverImageUrl ? 'border-red-500' : ''}
          />
          {errors.coverImageUrl && <p className="mt-1 text-sm text-red-500">{errors.coverImageUrl}</p>}
          <p className="mt-1 text-sm text-gray-500">
            Upload a cover image for your business profile (recommended size: 1200x400px)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gallery Images (Optional)
          </label>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {formData.galleryImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {formData.galleryImages.length < 6 && (
              <ImageUpload
                onChange={handleGalleryImageUpload}
                className="h-32"
              />
            )}
          </div>
          <p className="text-sm text-gray-500">
            Add up to 6 images showcasing your business (services, facilities, etc.)
          </p>
        </div>
      </div>
      
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