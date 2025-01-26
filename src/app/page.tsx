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

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-dark/30" />
          <Image
            src="/images/hero-bg.jpg"
            alt="Background"
            fill
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Book Local Services with Ease
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-100">
              Find and book trusted local service providers. From beauty treatments to professional services,
              we've got you covered.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href={user ? "/services" : "/register"}
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get Started
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5 inline-block" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="text-sm font-semibold leading-6 text-white"
              >
                Browse Services <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Services */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Services
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Discover our most popular services and book your next appointment.
            </p>
          </div>
          <ServiceSlideshow />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Why Choose PointMe
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your bookings
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We make it easy for you to find, book, and manage your service appointments.
              Our platform is designed with both customers and businesses in mind.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon
                      className="h-5 w-5 flex-none text-primary"
                      aria-hidden="true"
                    />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
