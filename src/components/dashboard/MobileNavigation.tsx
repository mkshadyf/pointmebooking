'use client';

import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { usePathname } from 'next/navigation';
import { MobileNavItem } from './MobileNavItem';

export function MobileNavigation() {
  useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/dashboard/business', icon: 'home' },
    { name: 'Bookings', href: '/dashboard/business/bookings', icon: 'calendar' },
    { name: 'Services', href: '/dashboard/business/services', icon: 'services' },
    { name: 'Settings', href: '/dashboard/business/settings', icon: 'settings' },
  ];

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