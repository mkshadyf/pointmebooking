'use client';

import { getNavigation, type NavigationItem } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

interface SidebarProps {
  role: 'business' | 'customer';
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

function NavItem({ item, isActive }: { item: NavigationItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`
        group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium
        ${isActive
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:text-primary hover:bg-gray-50'
        }
      `}
    >
      <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-x-2">
      <Image
        src="/logo.svg"
        alt="PointMe!"
        width={32}
        height={32}
        className="h-8 w-auto"
        priority
      />
     
    </Link>
  );
}

export function Sidebar({ role, isOpen = false, onClose, className }: SidebarProps) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const navigation = getNavigation(role);

  const sidebarContent = (
    <div className="flex h-full flex-col gap-y-5">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <Logo />
      </div>
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.category}>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.category}
            </h3>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={pathname === item.href}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
            {profile?.full_name?.[0] || '?'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {profile?.full_name || 'User'}
            </span>
            <span className="text-xs text-gray-500">
              {role === 'business' ? profile?.business_name : profile?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className={`relative z-[100] lg:hidden ${className}`}
          onClose={onClose || (() => {})}
        >
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
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white">
                  {sidebarContent}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col ${className}`}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
