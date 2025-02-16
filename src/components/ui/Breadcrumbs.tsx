'use client';

import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The segments to display in the breadcrumbs
   * If not provided, will be generated from the current path
   */
  segments?: Array<{
    name: string;
    href: string;
  }>;
  /**
   * Whether to show the home icon at the start
   */
  showHome?: boolean;
  /**
   * The separator between segments
   */
  separator?: React.ReactNode;
}

export function Breadcrumbs({
  segments: customSegments,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
  className,
  ...props
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate segments from pathname if not provided
  const segments = React.useMemo(() => {
    if (customSegments) return customSegments;

    return pathname!
      .split('/')
      .filter(Boolean)
      .map((segment, index, array) => {
        const href = `/${array.slice(0, index + 1).join('/')}`;
        return {
          name: segment.charAt(0).toUpperCase() + segment.slice(1),
          href,
        };
      });
  }, [pathname, customSegments]);

  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn(
        'flex items-center space-x-2 text-sm text-muted-foreground',
        className
      )}
      {...props}
    >
      {showHome && (
        <>
          <Link
            href="/"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
          {segments.length > 0 && (
            <span className="flex items-center">{separator}</span>
          )}
        </>
      )}
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <React.Fragment key={segment.href}>
            <Link
              href={segment.href}
              className={cn(
                'hover:text-foreground transition-colors',
                isLast && 'text-foreground font-medium pointer-events-none'
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {segment.name}
            </Link>
            {!isLast && <span className="flex items-center">{separator}</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
} 