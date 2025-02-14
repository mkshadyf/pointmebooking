import { signOutAction } from '@/app/actions';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/lib/supabase/auth/context/AuthContext';
import { classNames } from '@/lib/utils';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

type NavigationType = 'main' | 'dashboard';

interface NavigationProps {
  type: NavigationType;
}

export default function Navigation({ type }: NavigationProps) {
  const { user, signOut, profile } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    if (type === 'dashboard') {
      const response = await signOutAction();
      if (response.error) {
        console.error('Error signing out:', response.error);
      } else {
        window.location.href = '/login';
      }
    } else {
      signOut();
    }
  };

  const mainNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Businesses', href: '/businesses' },
    ...(profile?.role === 'business'
      ? [{ name: 'Dashboard', href: '/dashboard/business' }]
      : profile?.role === 'customer'
      ? [{ name: 'Dashboard', href: '/dashboard/customer' }]
      : []),
  ];

  const dashboardNavigation = profile?.role === 'business'
    ? [
        { name: 'Dashboard', href: '/dashboard/business' },
        { name: 'Appointments', href: '/dashboard/business/appointments' },
        { name: 'Services', href: '/dashboard/business/services' },
        { name: 'Settings', href: '/dashboard/business/settings' },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard/customer' },
        { name: 'My Appointments', href: '/dashboard/customer/appointments' },
        { name: 'Favorites', href: '/dashboard/customer/favorites' },
        { name: 'Settings', href: '/dashboard/customer/settings' },
      ];

  const navigation = type === 'main' ? mainNavigation : dashboardNavigation;
  const userNavigation = [
    { name: 'Your Profile', href: `/dashboard/${profile?.role}` },
    { name: 'Settings', href: `/dashboard/${profile?.role}/settings` },
  ];

  return (
    <Disclosure as="nav" className={clsx(
      'bg-white',
      type === 'main' ? 'fixed top-0 left-0 right-0 z-50 shadow' : 'border-b'
    )}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/">
                    {type === 'main' ? (
                      <Image
                        src="/logo.svg"
                        alt="PointMe!"
                        width={32}
                        height={32}
                        className="h-8 w-auto"
                        priority
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        PointMe
                      </span>
                    )}
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        pathname === item.href
                          ? 'border-primary text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {type === 'main' && !user ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      href={ROUTES.login.path}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Sign in
                    </Link>
                    <Link
                      href={ROUTES.register.path}
                      className="bg-primary text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/90"
                    >
                      Sign up
                    </Link>
                  </div>
                ) : (
                  <>
                    {type === 'dashboard' && (
                      <button
                        onClick={handleSignOut}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Sign out
                      </button>
                    )}
                    {type === 'main' && (
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <span className="sr-only">Open user menu</span>
                            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                              {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                              <div className="flex flex-col space-y-1 p-4">
                                <p className="text-sm font-medium leading-none">
                                  {profile?.full_name || 'User'}
                                </p>
                                <p className="text-xs leading-none text-gray-500">
                                  {user?.email || 'No email'}
                                </p>
                              </div>
                            </Menu.Item>
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    href={item.href}
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      'block px-4 py-2 text-sm text-gray-700'
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={handleSignOut}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block w-full px-4 py-2 text-left text-sm text-gray-700'
                                  )}
                                >
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    )}
                  </>
                )}
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={clsx(
                    pathname === item.href
                      ? 'bg-primary/5 border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {type === 'main' ? (
              user ? (
                <div className="border-t border-gray-200 pb-3 pt-4">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {profile?.full_name || 'User'}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user?.email || 'No email'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        href={item.href}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                    <Disclosure.Button
                      as="button"
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign out
                    </Disclosure.Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="space-y-1">
                    <Disclosure.Button
                      as={Link}
                      href={ROUTES.login.path}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign in
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      href={ROUTES.register.path}
                      className="block px-4 py-2 text-base font-medium text-primary hover:bg-gray-100"
                    >
                      Sign up
                    </Disclosure.Button>
                  </div>
                </div>
              )
            ) : (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <Disclosure.Button
                  as="button"
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 