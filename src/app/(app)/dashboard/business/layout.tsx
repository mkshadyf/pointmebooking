'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoading } from '@/components/ui/Loading';
import Link from 'next/link';
import { HomeIcon, CalendarIcon, BuildingStorefrontIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard/business',
    icon: HomeIcon,
  },
  {
    name: 'Bookings',
    href: '/dashboard/business/bookings',
    icon: CalendarIcon,
  },
  {
    name: 'Calendar',
    href: '/dashboard/business/calendar',
    icon: CalendarIcon,
  },
  {
    name: 'Services',
    href: '/dashboard/business/services',
    icon: BuildingStorefrontIcon,
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
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/dashboard/business">
                <span className="text-xl font-bold text-primary">PointMe</span>
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={clsx(
                            pathname === item.href
                              ? 'bg-gray-50 text-primary'
                              : 'text-gray-700 hover:text-primary hover:bg-gray-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon
                            className={clsx(
                              pathname === item.href
                                ? 'text-primary'
                                : 'text-gray-400 group-hover:text-primary',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
