'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { BusinessProfile } from '@/types';

export default function BusinessSettings() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Cast profile to BusinessProfile since we're in the business settings
  const businessProfile = profile as BusinessProfile | null;
  
  const [formData, setFormData] = useState<BusinessProfile>({
    id: businessProfile?.id || '',
    email: businessProfile?.email || '',
    role: 'business',
    business_name: businessProfile?.business_name || '',
    business_category: businessProfile?.business_category || '',
    full_name: businessProfile?.full_name || '',
    description: businessProfile?.description || '',
    location: businessProfile?.location || '',
    contact_number: businessProfile?.contact_number || '',
    working_hours: {
      start: businessProfile?.working_hours?.start || '09:00',
      end: businessProfile?.working_hours?.end || '17:00'
    },
    created_at: businessProfile?.created_at || new Date().toISOString(),
    updated_at: businessProfile?.updated_at || new Date().toISOString(),
    services: businessProfile?.services || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Only send the fields that can be updated
      const updateData: Partial<BusinessProfile> = {
        business_name: formData.business_name,
        business_category: formData.business_category,
        full_name: formData.full_name,
        description: formData.description,
        location: formData.location,
        contact_number: formData.contact_number,
        working_hours: formData.working_hours
      };

      await updateProfile(updateData);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Business Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              type="text"
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="business_category" className="block text-sm font-medium text-gray-700">
              Business Category
            </label>
            <input
              type="text"
              id="business_category"
              value={formData.business_category}
              onChange={(e) => setFormData({ ...formData, business_category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Owner Name
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="tel"
              id="contact_number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="working_hours_start" className="block text-sm font-medium text-gray-700">
                Opening Time
              </label>
              <input
                type="time"
                id="working_hours_start"
                value={formData.working_hours.start}
                onChange={(e) => setFormData({
                  ...formData,
                  working_hours: { ...formData.working_hours, start: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="working_hours_end" className="block text-sm font-medium text-gray-700">
                Closing Time
              </label>
              <input
                type="time"
                id="working_hours_end"
                value={formData.working_hours.end}
                onChange={(e) => setFormData({
                  ...formData,
                  working_hours: { ...formData.working_hours, end: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
