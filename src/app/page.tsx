'use client';

import { Navigation } from '@/components/navigation';
import { ServiceCard } from '@/components/services/ServiceCard';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/supabase/store';
import { ApprovalStatus, ServiceStatus, UIService } from '@/types';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon, CalendarIcon, ChartBarIcon, ClockIcon, Link, MapPinIcon, ShieldCheckIcon } from 'lucide-react';
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

export default function Home() {
  useStore();
  const [featuredServices, setFeaturedServices] = useState<UIService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<UIService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Function to retry fetching services
  const retryFetchServices = useCallback(() => {
    setError(null);
    setLoading(true);
    // This will trigger the useEffect to run again
  }, []);

  const fetchFeaturedServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, business:businesses(*), category:service_categories(*)')
        .eq('status', 'active')
        .eq('is_available', true)
        .eq('featured', true)
        .order('featured_order', { ascending: true })
        .limit(6);
        
      if (error) throw error;
      
      // Transform the raw database data to match the UIService interface
      const transformedData: UIService[] = ((data as unknown) as any[]).map(service => ({
        id: service.id,
        business_id: service.business_id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        image_url: service.image_url,
        is_available: service.is_available === null ? true : service.is_available,
        created_at: service.created_at || new Date().toISOString(), // Handle null with default
        updated_at: service.updated_at || new Date().toISOString(), // Handle null with default
        status: service.status as ServiceStatus, // Cast to enum type
        category_id: service.category_id,
        created_by_id: service.created_by_id || null,
        approved_by_id: service.approved_by_id || null,
        approved_at: service.approved_at || null,
        featured: Boolean(service.featured),
        featured_order: service.featured_order || null,
        approval_status: (service.approval_status as ApprovalStatus) || 'pending',
        admin_notes: service.admin_notes || null,
        business: service.business,
        category: service.category,
        // Include any other required properties from the UIService interface
        max_capacity: service.max_capacity || null,
        location: service.location || null
      }));
      
      setFeaturedServices(transformedData);
    } catch (err) {
      console.error('Error fetching services:', err);
      // Try to extract more information from the error
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load featured services. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedServices();
  }, [fetchFeaturedServices]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    
    // Debounced search function
    const searchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*, business:businesses(*), category:service_categories(*)')
          .eq('is_available', true)
          .eq('status', 'active')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(12);
          
        if (error) throw error;
        
        // Transform the data to match the UIService interface (similar to fetchFeaturedServices)
        const transformedData: UIService[] = ((data as unknown) as Array<{
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          price: number;
          duration: number;
          image_url: string | null;
          // Add missing properties that ServiceFromDB requires
          max_capacity: number | null;
          location: string | null;
          // Additional properties needed
          is_available: boolean;
          created_at: string | null;
          updated_at: string | null;
          status: string | null;
          category_id: string | null;
          created_by_id: string | null;
          approved_by_id: string | null;
          approved_at: string | null;
          featured: boolean;
          featured_order: number | null;
          approval_status: string;
          admin_notes: string | null;
          // Relationship properties
          business?: {
            id: string;
            name: string;
            description?: string;
            address?: string;
            city?: string;
            state?: string;
            phone?: string;
            email?: string;
            logo_url?: string;
          };
          category?: {
            id: string;
            name: string;
            icon?: string;
          };
          // Other properties can be undefined since we're not using them
        }>).map(service => ({
          id: service.id,
          business_id: service.business_id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          image_url: service.image_url,
          is_available: service.is_available === null ? true : service.is_available,
          created_at: service.created_at || new Date().toISOString(), // Handle null with default
          updated_at: service.updated_at || new Date().toISOString(), // Handle null with default
          status: service.status as ServiceStatus,
          category_id: service.category_id,
          created_by_id: service.created_by_id || null,
          approved_by_id: service.approved_by_id || null,
          approved_at: service.approved_at || null,
          featured: Boolean(service.featured),
          featured_order: service.featured_order || null,
          approval_status: (service.approval_status as any) || 'approved',
          admin_notes: service.admin_notes || null,
          business: service.business,
          category: service.category,
          max_capacity: service.max_capacity || null,
          location: service.location || null
        }));
        
        setSearchResults(transformedData);
      } catch (err) {
        console.error('Error searching services:', err);
        setError(
          err instanceof Error
            ? `Search error: ${err.message}`
            : 'Failed to search services. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    // Create a debounce effect with a timeout
    const timeoutId = setTimeout(() => {
      searchServices();
    }, 300); // Wait 300ms after typing stops
    
    // Cleanup the timeout on next render
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation type="main" />

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative mx-auto px-6 text-center text-white">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Find and Book Local Services
          </h1>
          <p className="mt-6 text-xl">
            Discover and book services from businesses in your area
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchFilter onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Search Results Section (conditionally rendered) */}
      {searchQuery && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {searchResults.length > 0 
                ? `Search results for "${searchQuery}"`
                : `No results found for "${searchQuery}"`}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600">Try a different search term or browse our featured services below.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Services Section (only show if not searching) */}
      {!searchQuery && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Featured Services
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Popular services booked by our customers
            </p>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="mt-8 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading services
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={retryFetchServices}
                        className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : featuredServices.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No services available</h3>
                <p className="mt-2 text-gray-500">Check back later for new services</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
                {featuredServices.map((service) => {
                  return <ServiceCard key={service.id} service={service} />
                })}
              </div>
            )}
            
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
      )}

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
