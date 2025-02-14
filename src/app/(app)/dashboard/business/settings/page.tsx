'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

import { DeleteAccount } from '@/components/settings/DeleteAccount';
import { ImageUpload } from '@/components/ui/ImageUpload';
 

import { Button, FormGroup, TextArea } from '@/components';
import { Input } from '@/components/ui/Input';
import { withAuth } from '@/lib/supabase';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { BusinessProfile } from '@/types';
import { Label } from 'node_modules/@headlessui/react/dist/components/label/label';
import { toast } from 'react-hot-toast';
 

function BusinessSettingsPage() {
  const { user } = useAuth();
  const [, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    location: '',
    contact_number: '',
    contact_email: '',
    website: '',
    business_type: '',
    business_category: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    logo_url: '',
    cover_image_url: ''
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setFormData({
          business_name: data.business_name || '',
          description: data.description || '',
          location: data.location || '',
          contact_number: data.contact_number || '',
          contact_email: data.contact_email || '',
          website: data.website || '',
          business_type: data.business_type || '',
          business_category: data.business_category || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          logo_url: data.logo_url || '',
          cover_image_url: data.cover_image_url || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleUpdateProfile = async (updatedProfile: Partial<BusinessProfile>) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('business_profiles')
        .update(updatedProfile)
        .eq('user_id', user.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    try {
      if (!user?.id) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `business/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      const imageField = type === 'logo' ? 'logo_url' : 'cover_image_url';
      setFormData(prev => ({ ...prev, [imageField]: publicUrl }));

      toast.success(`${type === 'logo' ? 'Logo' : 'Cover image'} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload ${type === 'logo' ? 'logo' : 'cover image'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await handleUpdateProfile(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Business Settings</h1>

        <div className="space-y-8">
          {/* Profile Settings Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <Label>Business Logo</Label>
                  <div className="mt-2">
                    <ImageUpload
                      initialUrl={formData.logo_url}
                      onChange={(file) => handleImageUpload(file, 'logo')}
                      maxSize={5}
                      aspectRatio={1}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Recommended: Square image, at least 200x200px
                  </p>
                </div>

                <div>
                  <Label>Cover Image</Label>
                  <div className="mt-2">
                    <ImageUpload
                      initialUrl={formData.cover_image_url}
                      onChange={(file) => handleImageUpload(file, 'cover')}
                      maxSize={10}
                      aspectRatio={16/9}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Recommended: 16:9 ratio, at least 1200x675px
                  </p>
                </div>
              </div>

              <FormGroup>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  type="text"
                  id="business_name"
                  name="business_name"
                  required
                  fullWidth
                  value={formData.business_name}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                  placeholder="Enter your business name"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="business_type">Business Type</Label>
                <Input
                  type="text"
                  id="business_type"
                  name="business_type"
                  fullWidth
                  value={formData.business_type}
                  onChange={(e) =>
                    setFormData({ ...formData, business_type: e.target.value })
                  }
                  placeholder="Enter your business type"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="business_category">Business Category</Label>
                <Input
                  type="text"
                  id="business_category"
                  name="business_category"
                  fullWidth
                  value={formData.business_category}
                  onChange={(e) =>
                    setFormData({ ...formData, business_category: e.target.value })
                  }
                  placeholder="Enter your business category"
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
                  placeholder="Describe your business"
                />
              </FormGroup>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormGroup>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    type="text"
                    id="location"
                    name="location"
                    fullWidth
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Enter your business location"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    fullWidth
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_number: e.target.value })
                    }
                    placeholder="Enter your contact number"
                  />
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormGroup>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    fullWidth
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_email: e.target.value })
                    }
                    placeholder="Enter your contact email"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    type="url"
                    id="website"
                    name="website"
                    fullWidth
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="Enter your website URL"
                  />
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormGroup>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    fullWidth
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter your address"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="city">City</Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    fullWidth
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Enter your city"
                  />
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormGroup>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    type="text"
                    id="state"
                    name="state"
                    fullWidth
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="Enter your state/province"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    fullWidth
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    placeholder="Enter your postal code"
                  />
                </FormGroup>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Business Settings Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Business Settings</h2>
            {/* Add business settings form here */}
          </div>

          {/* Danger Zone */}
          <div className="bg-white shadow rounded-lg p-6 border border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
            <DeleteAccount />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(BusinessSettingsPage);
