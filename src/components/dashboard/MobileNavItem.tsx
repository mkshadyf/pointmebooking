'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MobileNavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const MobileNavItem = ({ href, icon, label, isActive, onClick }: MobileNavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 p-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
        isActive && 'text-gray-900 dark:text-gray-50'
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};
