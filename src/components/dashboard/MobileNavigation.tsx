'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { usePathname } from 'next/navigation';
import { MobileNavItem } from './MobileNavItem';

export function MobileNavigation() {
  const { profile } = useAuth();
  const pathname = usePathname();

  const businessNavigation = [
    { name: 'Overview', href: '/dashboard/business', icon: 'home' },
    { name: 'Bookings', href: '/dashboard/business/appointments', icon: 'calendar' },
    { name: 'Services', href: '/dashboard/business/services', icon: 'services' },
    { name: 'Settings', href: '/dashboard/business/settings', icon: 'settings' },
  ];

  const customerNavigation = [
    { name: 'Overview', href: '/dashboard/customer', icon: 'home' },
    { name: 'Appointments', href: '/dashboard/customer/appointments', icon: 'calendar' },
    { name: 'Favorites', href: '/dashboard/customer/favorites', icon: 'heart' },
    { name: 'Settings', href: '/dashboard/customer/settings', icon: 'settings' },
  ];

  // Select navigation based on user role
  const navigation = profile?.role === 'business' ? businessNavigation : customerNavigation;

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          {navigation.map((item) => (
            <MobileNavItem
              key={item.name}
              href={item.href}
              isActive={pathname === item.href}
              icon={item.icon}
              label={item.name}
            />
          ))}
        </div>
      </div>
    </nav>
  );
} 