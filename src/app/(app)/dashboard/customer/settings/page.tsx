'use client';

import { DeleteAccount } from '@/components/settings/DeleteAccount';
import { withAuth } from '@/lib/auth/withAuth';

export default withAuth(function CustomerSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* Profile Settings Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            {/* Add profile settings form here */}
          </div>

          {/* Notification Settings Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
            {/* Add notification settings form here */}
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
});

