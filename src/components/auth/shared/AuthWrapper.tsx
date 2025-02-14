import Link from 'next/link';
import { ReactNode } from 'react';

export interface AuthWrapperProps {
  children: ReactNode;
  title: string;
  description?: ReactNode;
  subtitle?: string;
  footerText?: string;
  footerLink?: string;
  footerLinkText?: string;
}

export function AuthWrapper({
  children,
  title,
  description,
  subtitle,
  footerText,
  footerLink,
  footerLinkText,
}: AuthWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>
        {description && (
          <div className="mt-2 text-center text-sm text-gray-600">
            {description}
          </div>
        )}
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {children}

          {footerText && footerLink && footerLinkText && (
            <p className="mt-6 text-center text-sm text-gray-600">
              {footerText}{' '}
              <Link
                href={footerLink}
                className="font-medium text-primary hover:text-primary-dark"
              >
                {footerLinkText}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 