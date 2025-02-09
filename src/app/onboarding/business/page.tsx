'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoading } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';
import { BusinessProfile, WorkingHours } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const defaultWorkingHours: WorkingHours = {
  monday: { start: '09:00', end: '17:00', is_closed: false },
  tuesday: { start: '09:00', end: '17:00', is_closed: false },
  wednesday: { start: '09:00', end: '17:00', is_closed: false },
  thursday: { start: '09:00', end: '17:00', is_closed: false },
  friday: { start: '09:00', end: '17:00', is_closed: false },
  saturday: { start: '09:00', end: '14:00', is_closed: false },
  sunday: { start: '00:00', end: '00:00', is_closed: true }
};

export default function BusinessOnboarding() {
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({
    business_name: '',
    business_category: '',
    full_name: '',
    description: '',
    location: '',
    contact_number: '',
    working_hours: defaultWorkingHours
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.onboarding_completed) {
        router.push('/dashboard/business');
      }
    }
  }, [user, profile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { status, ...profileData } = formData;
      const sanitizedProfileData = {
        ...profileData,
        role: "business",
        onboarding_completed: true
      } as Partial<Omit<BusinessProfile, 'status'>>;
      
      await updateProfile(sanitizedProfileData);
      toast.success('Business profile created successfully!');
      router.push('/dashboard/business');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Business Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tell us more about your business
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <Input
                id="business_name"
                name="business_name"
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="business_category" className="block text-sm font-medium text-gray-700">
                Business Category
              </label>
              <Input
                id="business_category"
                name="business_category"
                type="text"
                required
                value={formData.business_category}
                onChange={(e) => setFormData({ ...formData, business_category: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Owner Name
              </label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Business Location
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <Input
                id="contact_number"
                name="contact_number"
                type="tel"
                required
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="working_hours" className="block text-sm font-medium text-gray-700">
                Working Hours
              </label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="time"
                    name="working_hours_start"
                    required
                    value={formData.working_hours?.monday.start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        working_hours: {
                          ...formData.working_hours!,
                          monday: {
                            ...formData.working_hours!.monday,
                            start: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    name="working_hours_end"
                    required
                    value={formData.working_hours?.monday.end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        working_hours: {
                          ...formData.working_hours!,
                          monday: {
                            ...formData.working_hours!.monday,
                            end: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? 'Creating Profile...' : 'Create Business Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 