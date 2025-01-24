'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '@/context/AuthContext';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';

export function Header() {
  const { signOut, profile } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            type="button"
            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <span className="sr-only">Open user menu</span>
              <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/dashboard/business/settings"
                      className={clsx(
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut()}
                      className={clsx(
                        active ? 'bg-gray-100' : '',
                        'block w-full text-left px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
          <div className="flex items-center">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-medium leading-none text-white">
                {profile?.business_name?.[0] || profile?.full_name?.[0] || 'U'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
