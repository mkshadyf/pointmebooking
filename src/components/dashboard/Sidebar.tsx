'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CalendarIcon, 
  BuildingStorefrontIcon, 
  Cog6ToothIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  {
    name: 'Overview',
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
    name: 'Customers',
    href: '/dashboard/business/customers',
    icon: UsersIcon,
  },
  {
    name: 'Analytics',
    href: '/dashboard/business/analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'Settings',
    href: '/dashboard/business/settings',
    icon: Cog6ToothIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard/business" className="flex items-center">
          <Image src="/logo.svg" alt="PointMe" width={32} height={32} className="mr-2" />
          <span className="text-xl font-bold text-gray-900">PointMe</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
              pathname === item.href
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
