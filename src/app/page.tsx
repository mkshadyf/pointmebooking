'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ServiceSlideshow } from '@/components/home/ServiceSlideshow';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import MainNav from '@/components/navigation/MainNav';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Define the interface for static categories
interface StaticCategory {
  name: string;
  image: string;
  href: string;
}

// Type guard to check if a category is a StaticCategory
function isStaticCategory(category: Category | StaticCategory): category is StaticCategory {
  return 'href' in category && 'image' in category;
}

// Helper function to get category image
function getCategoryImage(category: Category | StaticCategory): string {
  if (isStaticCategory(category)) {
    return category.image;
  }
  // For dynamic categories, use icon or fallback
  return `/images/categories/${category.icon || 'default'}.jpg`;
}

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

const popularCategories: StaticCategory[] = [
  { name: 'Beauty & Spa', image: '/categories/beauty.jpg', href: '/services/beauty' },
  { name: 'Health & Fitness', image: '/categories/fitness.jpg', href: '/services/fitness' },
  { name: 'Home Services', image: '/categories/home.jpg', href: '/services/home' },
  { name: 'Professional Services', image: '/categories/professional.jpg', href: '/services/professional' },
];

export default function Home() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { categories } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Handle search submission
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  // Memoize conditional content
  const heroContent = useMemo(() => user ? {
    title: `Welcome Back, ${profile?.full_name}!`,
    description: 'Continue exploring amazing services in your area',
    buttons: (
      <>
        <Link
          href="/dashboard/customer"
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150"
          aria-label="Go to your dashboard"
        >
          Go to Dashboard
          <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-150"
          aria-label="Browse available services"
        >
          Browse Services
        </Link>
      </>
    )
  } : {
    title: 'Book Local Services with Ease',
    description: "Discover and book the best local services. From beauty to home maintenance, we've got you covered.",
    buttons: (
      <>
        <Link
          href="/services"
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150"
          aria-label="Browse our services"
        >
          Browse Services
          <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-150"
          aria-label="Register your business"
        >
          List Your Business
        </Link>
      </>
    )
  }, [user, profile?.full_name]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowInstallPrompt(true);
    }, 30000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <MainNav />
      <main className="min-h-screen flex flex-col" role="main">
        {/* Hero Section */}
        <header className="relative min-h-[600px] mt-16 bg-gradient-to-br from-primary to-primary-dark" role="banner">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-pattern.png"
              alt=""
              fill
              className="opacity-10 object-cover"
              priority
              sizes="100vw"
              aria-hidden="true"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                {heroContent.title}
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in-delay">
                {heroContent.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
                {heroContent.buttons}
              </div>
            </div>

            {/* Search Bar */}
            <form 
              onSubmit={handleSearch} 
              className="max-w-2xl mx-auto mt-12"
              role="search"
              aria-label="Search services"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="w-full px-6 py-4 text-lg rounded-full shadow-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Search services"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white text-primary hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
                  aria-label="Submit search"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" aria-hidden="true" />
                  <span className="sr-only">Search</span>
                </button>
              </div>
            </form>
          </div>
        </header>

        {/* Featured Services */}
        <section 
          className="py-20 bg-gray-50" 
          aria-labelledby="featured-services-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 
                id="featured-services-heading" 
                className="text-3xl font-bold text-gray-900"
              >
                Featured Services
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Discover our most popular and highly-rated services
              </p>
            </div>
            <ErrorBoundary>
              <div aria-live="polite" aria-atomic="true">
                <ServiceSlideshow />
              </div>
            </ErrorBoundary>
          </div>
        </section>

        {/* Popular Categories */}
        <section 
          className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
          aria-labelledby="categories-heading"
        >
          <div className="max-w-7xl mx-auto">
            <h2 
              id="categories-heading"
              className="text-3xl font-bold text-center mb-12"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Popular Categories
              </span>
            </h2>
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              role="list"
            >
              {(categories.length > 0 ? categories : popularCategories).map((category) => {
                const categoryLink = isStaticCategory(category) 
                  ? category.href 
                  : `/services?category=${category.id}`;
                
                const categoryImage = getCategoryImage(category);

                return (
                  <Link
                    key={category.name}
                    href={categoryLink}
                    className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300"
                    role="listitem"
                  >
                    <div className="relative h-64 w-full">
                      <Image
                        src={categoryImage}
                        alt={`${category.name} category`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-semibold text-white group-hover:translate-x-2 transition-transform duration-300">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section 
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
          aria-labelledby="features-heading"
        >
          <div className="max-w-7xl mx-auto">
            <h2 
              id="features-heading"
              className="text-3xl font-bold text-center mb-12"
            >
              Why Choose PointMe?
            </h2>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              role="list"
            >
              {features.map((feature) => (
                <div 
                  key={feature.name} 
                  className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                  role="listitem"
                >
                  <div>
                    <span className="absolute h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </span>
                    <h3 className="ml-16 text-xl font-semibold mb-4">{feature.name}</h3>
                  </div>
                  <p className="mt-2 text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="relative bg-gradient-to-r from-primary to-primary/90 py-20 px-4 sm:px-6 lg:px-8"
          aria-label="Call to action"
        >
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              {user ? 'Ready to Book Your Next Service?' : 'Ready to Get Started?'}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  href="/services"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-150"
                  aria-label="Browse available services"
                >
                  Browse Services
                  <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-150"
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-150"
                    aria-label="Create a new account"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Install Prompt - Only show once per session and after 30 seconds */}
        {user && showInstallPrompt && (
          <div
            className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg max-w-sm transform transition-transform duration-300 ease-in-out"
            style={{ transform: 'translateY(0)' }}
            id="install-prompt"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                Get the PointMe app
              </p>
              <button
                onClick={() => {
                  const prompt = document.getElementById('install-prompt');
                  if (prompt) prompt.style.transform = 'translateY(120%)';
                }}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
