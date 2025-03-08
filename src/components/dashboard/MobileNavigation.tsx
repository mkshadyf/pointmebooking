'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { NAVIGATION } from '@/routes';
import { usePathname } from 'next/navigation';
import { MobileNavItem } from './MobileNavItem';

export function MobileNavigation() {
  const { profile } = useAuth();
  const pathname = usePathname();

  // Select navigation based on user role
  const navigation = profile?.role === 'business' 
    ? NAVIGATION.BUSINESS_DASHBOARD 
    : NAVIGATION.CUSTOMER_DASHBOARD;

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