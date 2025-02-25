'use client';

import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useAuthSync } from '@/hooks/useAuthSync';
import { useToast } from '@/hooks/useToast';
import { ErrorHandler, ErrorType } from '@/lib/error-handling';
import { supabase } from '@/lib/supabase';
import { transformJoinedServiceData } from '@/lib/supabase/utils/transformers';
import { Service } from '@/types';
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Separate the service details component from the error boundary wrapper
function ServiceDetails() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthSync({ 
    redirectToLogin: false,
    requireAuth: false
  });
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchService = async () => {
      if (!params.id || typeof params.id !== 'string') {
        setError('Invalid service ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Fetch service with business and category in a single query
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select(`
            *,
            business:profiles(*),
            category:service_categories(*)
          `)
          .eq('id', params.id)
          .single();

        if (serviceError) {
          // Use our error handler to get a consistent error
          const appError = ErrorHandler.convertToAppError(serviceError);
          
          // Set appropriate error message based on error type
          if (appError.type === ErrorType.NOT_FOUND) {
            setError('Service not found');
          } else {
            setError(ErrorHandler.getUserFriendlyMessage(appError));
          }
          
          setLoading(false);
          return;
        }

        if (!serviceData) {
          setError('Service not found');
          setLoading(false);
          return;
        }

        // Use the transformer to get a properly typed Service object
        const completeServiceData = transformJoinedServiceData(serviceData);
        
        if (!completeServiceData) {
          setError('Failed to process service data');
          setLoading(false);
          return;
        }

        setService(completeServiceData);
      } catch (err) {
        // Handle unexpected errors
        const appError = ErrorHandler.convertToAppError(err);
        
        setError(ErrorHandler.getUserFriendlyMessage(appError));
        showToast({ 
          type: 'error', 
          message: ErrorHandler.getUserFriendlyMessage(appError)
        });
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [params.id, showToast]);

  // Handle booking action with feedback
  const handleBooking = () => {
    if (!isAuthenticated) {
      showToast({ 
        type: 'info', 
        message: 'Please sign in to book this service' 
      });
      router.push(`/login?redirect=/services/${service?.id}/book`);
      return;
    }
    
    if (!service?.is_available) {
      showToast({ 
        type: 'warning', 
        message: 'This service is currently not available for booking' 
      });
      return;
    }
    
    router.push(`/services/${service.id}/book`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation type="main" />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation type="main" />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Service not found'}
          </h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation type="main" />

      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            className="object-cover opacity-60"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 opacity-75" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="flex items-center gap-2 mb-2">
            {service.category?.icon && (
              <span className="material-icons text-white/90">{service.category.icon}</span>
            )}
            {service.category?.name && (
              <span className="text-white/90">{service.category.name}</span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{service.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5" />
              <span>R{service.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>{service.duration} mins</span>
            </div>
            {service.business?.city && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                <span>{service.business.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this service</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{service.description}</p>
              
              {service.business?.description && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About the business</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{service.business.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                {service.business?.logo_url ? (
                  <Image
                    src={service.business.logo_url}
                    alt={`${service.business.name || 'Business'} logo`}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-purple-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.business?.name || 'Business Name'}
                  </h3>
                  {service.business?.city && (
                    <p className="text-gray-600">{service.business.city}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {(service.business?.phone || service.business?.email || service.business?.address) && (
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  {service.business.address && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPinIcon className="h-5 w-5 flex-shrink-0" />
                      <span className="line-clamp-2">{service.business.address}</span>
                    </div>
                  )}
                  {service.business.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <PhoneIcon className="h-5 w-5 flex-shrink-0" />
                      <span>{service.business.phone}</span>
                    </div>
                  )}
                  {service.business.email && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="break-all">{service.business.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Booking Button */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <Button
                onClick={handleBooking}
                className="w-full flex items-center justify-center gap-2"
                disabled={!service.is_available}
              >
                <CalendarIcon className="h-5 w-5" />
                {service.is_available ? 'Book Now' : 'Not Available'}
              </Button>
              {!isAuthenticated && service.is_available && (
                <p className="mt-3 text-sm text-center text-gray-500">
                  <Link href={`/login?redirect=/services/${service.id}/book`} className="text-purple-600 hover:text-purple-700">
                    Sign in
                  </Link>{' '}
                  to book this service
                </p>
              )}
              {!service.is_available && (
                <p className="mt-3 text-sm text-center text-gray-500">
                  This service is currently not available for booking
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap the component with ErrorBoundary
export default function ServiceDetailsPage() {
  const { showToast } = useToast();
  
  const handleError = (error: Error) => {
    // Use our error handler to get a consistent error
    const appError = ErrorHandler.convertToAppError(error);
    ErrorHandler.logError(ErrorHandler.convertToAppError(appError, 'ServiceDetailsPage'));
    
    showToast({
      type: 'error',
      message: ErrorHandler.getUserFriendlyMessage(appError)
    });
  };
  
  return (
    <ErrorBoundary onError={handleError}>
      <ServiceDetails />
    </ErrorBoundary>
  );
} 