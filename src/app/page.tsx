'use client';

import { useAuth } from '@/context/AuthContext';
import { ServiceSlideshow } from '@/components/home/ServiceSlideshow';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Easy Booking',
    description: 'Book your favorite services with just a few clicks. No more waiting in line or phone calls.',
    icon: CalendarIcon,
  },
  {
    name: 'Real-time Availability',
    description: 'See real-time availability and book instantly. No more back-and-forth communication.',
    icon: ClockIcon,
  },
  {
    name: 'Local Services',
    description: 'Find the best local service providers near you. All vetted and trusted.',
    icon: MapPinIcon,
  },
  {
    name: 'Verified Reviews',
    description: 'Read authentic reviews from real customers to make informed decisions.',
    icon: UserGroupIcon,
  },
  {
    name: 'Business Analytics',
    description: 'For businesses: Get detailed insights about your services and customer preferences.',
    icon: ChartBarIcon,
  },
  {
    name: 'Secure Payments',
    description: 'Safe and secure payment processing for all your bookings.',
    icon: ShieldCheckIcon,
  },
];

const popularCategories = [
  { name: 'Beauty & Spa', image: '/categories/beauty.jpg', href: '/services/beauty' },
  { name: 'Health & Fitness', image: '/categories/fitness.jpg', href: '/services/fitness' },
  { name: 'Home Services', image: '/categories/home.jpg', href: '/services/home' },
  { name: 'Professional Services', image: '/categories/professional.jpg', href: '/services/professional' },
];

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Conditional Rendering */}
      <div className="relative">
        <ServiceSlideshow />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              {user ? `Welcome Back, ${profile?.full_name}!` : 'Book Local Services with Ease'}
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              {user 
                ? 'Continue exploring amazing services in your area'
                : "Discover and book the best local services. From beauty to home maintenance, we've got you covered."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    href="/dashboard/customer"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                  >
                    Go to Dashboard
                    <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary transition-colors"
                  >
                    Browse Services
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/services"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                  >
                    Browse Services
                    <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary transition-colors"
                  >
                    List Your Business
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PointMe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div>
                  <span className="absolute h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </span>
                  <h3 className="ml-16 text-xl font-semibold mb-4">{feature.name}</h3>
                </div>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-primary py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            {user ? 'Ready to Book Your Next Service?' : 'Ready to Get Started?'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/services"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-50"
              >
                Browse Services
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
