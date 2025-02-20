'use client';

import { DataTable } from '@/components/DataTable'; // Import DataTable
import { Card } from '@/components/ui/Card';
import { CardContent } from '@/components/ui/CardContent';
import { CardHeader } from '@/components/ui/CardHeader';
import { CardTitle } from '@/components/ui/CardTitle';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { userColumns, UserData } from './columns'; // Import column definitions

interface BusinessData {
  id: string;
  business_name: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!profile || profile.role !== 'admin') {
        router.push('/'); // Redirect to home if not an admin
        return;
      }

      const fetchData = async () => {
        try {
          // Fetch all users
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, email, role, created_at');

          if (usersError) throw usersError;
          setUsers(usersData || []);

          // Fetch all businesses
          const { data: businessData, error: businessError } = await supabase
            .from('business_profiles')
            .select('id, business_name, created_at');

          if (businessError) throw businessError;
          setBusinesses(businessData || []);

          setLoading(false);
        } catch (err: any) {
          setError(err.message || 'An error occurred');
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [authLoading, profile, router]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile || profile.role !== 'admin') {
    return <div>Unauthorized</div>; // Should be handled by redirect, but this is a fallback
  }

  const handleAddUser = () => {
    // Implement logic to add a new user (e.g., open a modal)
    console.log('Add User');
  };

  const handleEditUser = (user: UserData) => {
    // Implement logic to edit a user (e.g., open a modal with pre-filled data)
    console.log('Edit User:', user);
  };

  const handleDeleteUser = async (user: UserData) => {
    // Implement logic to delete a user (with confirmation)
    console.log('Delete User:', user);
    // Example:
    // const confirmed = confirm(`Are you sure you want to delete user ${user.email}?`);
    // if (confirmed) {
    //   try {
    //     const { error } = await supabase.from('profiles').delete().eq('id', user.id);
    //     if (error) throw error;
    //     // Refresh user list
    //     setUsers(users.filter((u) => u.id !== user.id));
    //   } catch (err) {
    //     console.error("Error deleting user:", err);
    //   }
    // }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={userColumns}
            data={users}
            onAdd={handleAddUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </CardContent>
      </Card>

      {/* Add DataTable for Businesses here, similar to the Users table */}
    </div>
  );
} 