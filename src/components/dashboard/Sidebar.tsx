'use client';

import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { usePathname } from 'next/navigation';
import { NavItem } from './NavItem';
export function DashboardSidebar() {
  const { profile } = useAuth();
  const pathname = usePathname();

  const navigation = profile?.role === 'business' ? [
    { name: 'Overview', href: '/dashboard', icon: 'home' },
    { name: 'Bookings', href: '/dashboard/bookings', icon: 'calendar' },
    { name: 'Services', href: '/dashboard/services', icon: 'services' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'chart' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
  ] : [
    { name: 'Overview', href: '/dashboard', icon: 'home' },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: 'calendar' },
    { name: 'Favorites', href: '/dashboard/favorites', icon: 'heart' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
  ];

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavItem
                  key={item.name}
                  href={item.href}
                  isActive={pathname === item.href}
                  icon={item.icon}
                  label={item.name}
                  onClick={() => {}}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
} 