'use client';

import { Skeleton } from '@/components';
import { Navigation } from '@/components/navigation';
import { ServiceCard } from '@/components/services/ServiceCard';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { useStore } from '@/lib/supabase/store';
import {
  ArrowRightIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const features = [
  {
    name: 'Easy Booking',
    description: 'Book your favorite services in just a few clicks.',
    icon: CalendarIcon,
  },
  {
    name: 'Real-time Availability',
    description: 'See real-time availability and book instantly.',
    icon: ClockIcon,
  },
  {
    name: 'Local Services',
    description: 'Find trusted local service providers near you.',
    icon: MapPinIcon,
  },
  {
    name: 'Verified Reviews',
    description: 'Read authentic reviews from real customers.',
    icon: UserGroupIcon,
  },
  {
    name: 'Business Analytics',
    description: 'Get insights to grow your business.',
    icon: ChartBarIcon,
  },
  {
    name: 'Secure Payments',
    description: 'Safe and secure payment processing.',
    icon: ShieldCheckIcon,
  },
];

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
  business?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    logo_url: string;
  };
  category?: {
    name: string;
    icon: string;
  };
}

export default function Home() {
  const { categories } = useStore();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchFeaturedServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          business:profiles!services_business_id_fkey (
            id,
            business_name,
            address,
            city,
            state,
            phone,
            email,
            logo_url
          ),
          category:categories (
            name,
            icon
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFeaturedServices();
  }, [fetchFeaturedServices]);

  const handleSearch = useCallback((query: string) => {
    // Implement search functionality
    console.log('Search query:', query);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation type="main" />

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative mx-auto px-6 text-center text-white">
          <h1 className="text-4xl font-bold sm:text-6xl">
            Find and Book Local Services
          </h1>
          <p className="mt-6 text-xl text-white/90">
            Discover trusted professionals for all your service needs
          </p>
          
          {/* Search Component */}
          <div className="mx-auto mt-8 max-w-2xl">
            <SearchFilter
              categories={categories.map((cat: { name: string }) => cat.name)}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900">Latest Services</h2>
          <p className="mt-2 text-gray-600">
            Explore our available services
          </p>
          
          <div className="mt-8">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : error ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Oops! Something went wrong</h3>
                <p className="mt-2 text-gray-500">{error}</p>
                <button
                  onClick={() => fetchFeaturedServices()}
                  className="mt-4 text-purple-600 hover:text-purple-700"
                >
                  Try again
                </button>
              </div>
            ) : featuredServices.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No services available</h3>
                <p className="mt-2 text-gray-500">Check back later for new services</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredServices.map((service) => {
                  const validatedService = {
                    ...service,
                    status: service.status && ['active', 'inactive', 'deleted'].includes(service.status)
                      ? service.status as 'active' | 'inactive' | 'deleted'
                      : 'active'
                  };
                  return <ServiceCard key={service.id} service={validatedService} />
                })}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/services"
              className="inline-flex items-center rounded-md bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 transition-colors shadow-md"
            >
              View All Services
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Why Choose Us
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Everything you need to find and book services
          </p>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col items-center rounded-lg bg-white p-6 text-center transition-all hover:shadow-xl"
              >
                <feature.icon className="h-12 w-12 text-purple-600" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {feature.name}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 py-16">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Join thousands of satisfied customers who trust our platform
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/services"
              className="rounded-md bg-white px-6 py-3 text-purple-700 hover:bg-gray-50 transition-colors shadow-md"
            >
              Browse Services
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-white/30 px-6 py-3 text-white hover:bg-white/10 transition-colors"
            >
              List Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
