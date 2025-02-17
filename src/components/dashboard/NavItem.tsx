'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const NavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
        isActive && 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50'
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};
