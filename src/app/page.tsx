'use client';

import Navigation from '@/components/navigation/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/lib/store';
import {
  ArrowRightIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface StaticCategory {
  name: string;
  image: string;
  href: string;
}

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

const popularCategories: StaticCategory[] = [
  { name: 'Beauty & Spa', image: '/categories/beauty.jpg', href: '/services/beauty' },
  { name: 'Health & Fitness', image: '/categories/fitness.jpg', href: '/services/fitness' },
  { name: 'Home Services', image: '/categories/home.jpg', href: '/services/home' },
  { name: 'Professional Services', image: '/categories/professional.jpg', href: '/services/professional' },
];

export default function Home() {
  const { user, profile } = useAuth();
  const { categories } = useAppStore();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const heroContent = useMemo(() => {
    if (user) {
      return {
        title: `Welcome Back, ${profile?.full_name}!`,
        description: 'Continue exploring the best services in your area.',
        buttons: (
          <>
            <Link
              href="/dashboard/customer"
              className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Go to your dashboard"
            >
              Go to Dashboard
              <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-3 border border-white text-white rounded-md hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Browse available services"
            >
              Browse Services
            </Link>
          </>
        ),
      };
    }
    return {
      title: 'Book Local Services with Ease',
      description: 'Discover and book top local services effortlessly.',
      buttons: (
        <>
          <Link
            href="/services"
            className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Browse our services"
          >
            Browse Services
            <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-3 border border-white text-white rounded-md hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Register your business"
          >
            List Your Business
          </Link>
        </>
      ),
    };
  }, [user, profile?.full_name]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowInstallPrompt(true);
    }, 30000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation type="main" />
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center bg-gradient-to-r from-blue-600 to-indigo-700"
      >
        <div className="absolute inset-0 bg-black/50">
          <div className="container mx-auto px-6 py-32 text-center text-white">
            <h1 className="text-4xl font-bold sm:text-6xl">{heroContent.title}</h1>
            <p className="mt-6 text-lg">{heroContent.description}</p>
            <div className="mt-10 flex justify-center gap-6">
              {heroContent.buttons}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-base font-semibold uppercase tracking-wider text-primary">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold sm:text-4xl">
            Simplify your life, one booking at a time
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Experience hassle-free scheduling and connect with trusted service providers.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-center px-4">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">{feature.name}</h3>
                <p className="mt-2 text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Popular Categories</h2>
          <p className="mt-4 text-lg text-gray-600">
            Explore our most popular service categories
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {popularCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative block overflow-hidden rounded-2xl"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20"></div>
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to streamline your bookings?
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Join thousands of users who trust our platform for easy booking.
          </p>
          <div className="mt-8 flex justify-center gap-6">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Get Started
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-3 border border-primary text-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Install Prompt (optional) */}
      {/* {showInstallPrompt && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow text-center">
          <p className="text-sm text-gray-700">Install our app for a better experience!</p>
          <button className="mt-2 inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary">
            Install Now
          </button>
        </div>
      )} */}
    </div>
  );
}
