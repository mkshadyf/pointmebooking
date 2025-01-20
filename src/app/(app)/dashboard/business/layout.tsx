'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoading } from '@/components/ui/Loading';
import Link from 'next/link';
import { BuildingStorefrontIcon, CalendarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard/business',
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Bookings',
    href: '/dashboard/business/bookings',
    icon: CalendarIcon,
  },
  {
    name: 'Settings',
    href: '/dashboard/business/settings',
    icon: Cog6ToothIcon,
  },
];

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'business')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <PageLoading />;
  if (!user || user.role !== 'business') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-full">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-gray-900">Business Dashboard</span>
            </div>
            <nav className="mt-8 flex-1 flex flex-col" aria-label="Sidebar">
              <div className="px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        pathname === item.href
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                      )}
                    >
                      <Icon
                        className={clsx(
                          pathname === item.href
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-gray-500',
                          'mr-4 flex-shrink-0 h-6 w-6'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
