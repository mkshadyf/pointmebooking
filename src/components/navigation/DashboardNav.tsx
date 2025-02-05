'use client';

import { signOutAction } from '@/app/actions';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav() {
  const { profile } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const response = await signOutAction();
    if (response.error) {
      console.error('Error signing out:', response.error);
    } else {
      window.location.href = '/login';
    }
  };

  const isBusinessUser = profile?.role === 'business';

  const navItems = isBusinessUser
    ? [
        { href: '/dashboard/business', label: 'Dashboard' },
        { href: '/dashboard/business/appointments', label: 'Appointments' },
        { href: '/dashboard/business/services', label: 'Services' },
        { href: '/dashboard/business/settings', label: 'Settings' },
      ]
    : [
        { href: '/dashboard/customer', label: 'Dashboard' },
        { href: '/dashboard/customer/appointments', label: 'My Appointments' },
        { href: '/dashboard/customer/favorites', label: 'Favorites' },
        { href: '/dashboard/customer/settings', label: 'Settings' },
      ];

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                PointMe
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleSignOut}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === item.href
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
