'use client';

import { useAuth } from '@/context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { CalendarIcon, ChartBarIcon, CogIcon, HomeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

interface SidebarProps {
  role: 'business' | 'customer';
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen = false, onClose }: SidebarProps) {
  useAuth();
  const pathname = usePathname();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: `/dashboard/${role}`, 
      icon: HomeIcon 
    },
    { 
      name: role === 'business' ? 'Appointments' : 'My Bookings', 
      href: `/dashboard/${role}/appointments`, 
      icon: CalendarIcon 
    },
    { 
      name: role === 'business' ? 'Services' : 'Favorites', 
      href: `/dashboard/${role}/${role === 'business' ? 'services' : 'favorites'}`, 
      icon: ChartBarIcon 
    },
    { 
      name: 'Settings', 
      href: `/dashboard/${role}/settings`, 
      icon: CogIcon 
    },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose || (() => {})}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => {}}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>

                {/* Sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <Link href="/" className="flex items-center space-x-2">
                      <Image
                        src="/logo.svg"
                        alt="PointMe!"
                        width={32}
                        height={32}
                        className="h-8 w-auto"
                        priority
                      />
                      <span className="text-xl font-semibold text-gray-900">
                        PointMe!
                      </span>
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
                                className={`
                                  group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                                  ${
                                    pathname === item.href
                                      ? 'bg-gray-50 text-primary'
                                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                                  }
                                `}
                                onClick={() => {}}
                              >
                                <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-bold text-gray-900">PointMe!</span>
          </div>
          <nav className="mt-8 flex-1 flex flex-col">
            <div className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      pathname === item.href
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
