'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/supabase';
import { handleClientError } from '@/lib/supabase/utils';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function DeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (!user) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Delete all user data in order:
      
      // 1. Delete user's bookings
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .eq('customer_id', user.id);
      
      if (bookingsError) throw new Error('Failed to delete bookings data');

      // 2. If business user, delete services
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'business') {
        const { error: servicesError } = await supabase
          .from('services')
          .delete()
          .eq('business_id', user.id);

        if (servicesError) throw new Error('Failed to delete business services');
      }

      // 3. Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw new Error('Failed to delete profile data');

      // 4. Delete the auth user
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (authDeleteError) throw new Error('Failed to delete account completely');

      // 5. Sign out
      await supabase.auth.signOut();

      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      handleClientError(error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Account</h3>
        <p className="mt-1 text-sm text-gray-500">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </div>
      <div className="mt-5">
        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          loading={isDeleting}
        >
          {isDeleting ? 'Deleting Account...' : 'Delete Account'}
        </Button>
      </div>
    </div>
  );
} 