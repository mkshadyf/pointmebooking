/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Service } from '@/types';
import { PageLoading } from '@/components/ui/Loading';

export default function ServiceDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { serviceCategories, businessCategories } = useAppStore();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const service = serviceCategories
          .flatMap((cat) => cat.services)
          .find((s) => s.id === params.id);

        if (!service) throw new Error('Service not found');

        setService(service);
      } catch (err) {
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id, serviceCategories]);

  if (loading) return <PageLoading />;
  if (!service) return <div>Service not found</div>;

  // Find the business that offers this service
  const business = businessCategories
    .flatMap((cat) => cat.businesses)
    .find((b) => b.id === service.business_id);

  if (!business) return <div>Business not found</div>;

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would make an API call to create the booking
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Booking request sent successfully!');
      router.push('/dashboard/customer');
    } catch (error) {
      toast.error('Failed to create booking:' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                <p className="mt-4 text-lg text-gray-600">{service.description}</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{service.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium text-xl">${service.price}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{service.category_id}</span>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="border-t md:border-t-0 md:border-l border-gray-200 md:pl-8 pt-8 md:pt-0">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Provided by {business.business_name}
                </h2>
                <p className="mt-4 text-gray-600">{business.description}</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2">{business.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">Contact:</span>
                    <span className="ml-2">{business.contact_number}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">Working Hours:</span>
                    <span className="ml-2">
                      {business.working_hours.start} - {business.working_hours.end}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Button */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {user ? 'Ready to book?' : 'Sign in to book this service'}
                  </p>
                </div>
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : user ? 'Book Now' : 'Sign in to Book'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
