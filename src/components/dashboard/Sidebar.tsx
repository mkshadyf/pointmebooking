'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  CalendarIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/business', icon: HomeIcon },
  { name: 'Services', href: '/dashboard/business/services', icon: ShoppingBagIcon },
  { name: 'Calendar', href: '/dashboard/business/calendar', icon: CalendarIcon },
  { name: 'Customers', href: '/dashboard/business/customers', icon: UserGroupIcon },
  { name: 'Settings', href: '/dashboard/business/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const pathname = usePathname();

  return (
    <div className={classNames(
      'flex flex-col h-full',
      mobile ? 'py-4' : 'border-r border-gray-200 pt-5 pb-4'
    )}>
      <div className="flex flex-col flex-grow">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.svg"
                alt="PointMe"
                fill
                className="object-contain"
              />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">PointMe!</span>
          </Link>
        </div>

        {/* Business Info */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{profile?.business_name}</h2>
          <p className="text-sm text-gray-500">{profile?.business_type}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1 bg-white" aria-label="Sidebar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-gray-100 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary',
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150 ease-in-out'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="px-2 mt-auto">
        <button
          onClick={signOut}
          className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-red-600"
        >
          <ArrowLeftOnRectangleIcon
            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600"
            aria-hidden="true"
          />
          Sign Out
        </button>
      </div>
    </div>
  );
}
