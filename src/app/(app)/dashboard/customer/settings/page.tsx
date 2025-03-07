'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/hooks/auth/useAuth';
import { useState } from 'react';

export default function CustomerSettingsPage() {
  const { user, profile, isLoading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });

  // Load profile data when component mounts
  useState(() => {
    if (profile) {
      setFormData({
        fullName: profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}`.trim() 
          : '',
        phone: profile.phone_number || '',
        address: '', // Address is not stored in the profile yet
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simulate update delay
    setTimeout(() => {
      setIsUpdating(false);
      // Show success notification or feedback
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Information</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  To change your email, please contact support
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your address"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Account Security</h3>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Password</h4>
            <p className="text-sm text-gray-500">
              Change your password or reset it if forgotten
            </p>
          </div>
          <Button variant="outline">Change Password</Button>
        </div>
      </Card>
    </div>
  );
} 