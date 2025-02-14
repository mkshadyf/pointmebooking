'use client';

import { Button } from '@/components/ui/Button';
import { Column, DataTable } from '@/components/ui/DataTable';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category_id: string;
  image_url: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  status: string | null;
}

export default function BusinessServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const columns: Column<Service>[] = [
    { 
      key: 'name' as keyof Service, 
      header: 'Name', 
      editable: true 
    },
    { 
      key: 'description' as keyof Service, 
      header: 'Description', 
      editable: true 
    },
    {
      key: 'price' as keyof Service,
      header: 'Price',
      type: 'currency',
      editable: true,
      render: (value: number) => `R${value.toFixed(2)}`,
    },
    { 
      key: 'duration' as keyof Service, 
      header: 'Duration (mins)', 
      editable: true, 
      type: 'number' 
    },
    {
      key: 'is_available' as keyof Service,
      header: 'Available',
      type: 'boolean',
      editable: true,
      render: (value: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  const handleEdit = async (service: Service, field: keyof Service, value: unknown) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ [field]: value })
        .eq('id', service.id);

      if (error) throw error;

      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, [field]: value } : s
        )
      );
    } catch (err) {
      console.error('Error updating service:', err);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id);

      if (error) throw error;
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const getBusinessServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.id]);

  useEffect(() => {
    if (user?.id) {
      getBusinessServices();
    }
  }, [user?.id, getBusinessServices]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your service offerings
          </p>
        </div>
        <Link href="/dashboard/business/services/add" passHref>
          <Button>Add Service</Button>
        </Link>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      ) : (
        <DataTable
          data={services}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
          searchFields={['name', 'description']}
        />
      )}
    </div>
  );
}
