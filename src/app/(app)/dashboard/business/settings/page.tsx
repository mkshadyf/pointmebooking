'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Input,
  TextArea,
  Label,
  FormGroup,
  Button,
} from '@/components/ui/form';

export default function BusinessSettings() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: profile?.business_name || '',
    description: profile?.description || '',
    location: profile?.location || '',
    contact_number: profile?.contact_number || '',
    contact_email: profile?.contact_email || '',
    website: profile?.website || '',
    business_type: profile?.business_type || '',
    business_category: profile?.business_category || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    postal_code: profile?.postal_code || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Settings updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update settings');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your business profile and settings.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
              <Label htmlFor="state">State</Label>
              <Input
                type="text"
                id="state"
                name="state"
                fullWidth
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="Enter your state"
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
