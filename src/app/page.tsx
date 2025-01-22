'use client';

import { ServiceSlideshow } from '@/components/home/ServiceSlideshow';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <ServiceSlideshow />

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PointMe?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Easy Booking</h3>
              <p className="text-gray-600">Book your favorite services with just a few clicks. No more waiting in line or phone calls.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Top Service Providers</h3>
              <p className="text-gray-600">Access a curated list of the best service providers in your area. Quality guaranteed.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Instant Confirmation</h3>
              <p className="text-gray-600">Get instant booking confirmations and reminders. Never miss an appointment again.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <div className="space-x-4">
            <Link
              href="/services"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
            >
              Browse Services
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50"
            >
              List Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
