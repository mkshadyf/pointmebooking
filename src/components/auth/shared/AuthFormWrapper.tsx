'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthFormWrapperProps {
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

export function AuthFormWrapper({
  title,
  description,
  onSubmit,
  children
}: AuthFormWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center">
            <span className="sr-only">Your Logo</span>
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-9 w-9 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </Link>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-gray-900">
          {title}
        </h2>
        <p className="mt-3 text-center text-sm md:text-base text-gray-600 max-w-md mx-auto">
          {description}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-6 sm:px-10 md:px-12 shadow-lg sm:rounded-xl transition-shadow duration-300 hover:shadow-xl">
          <form className="space-y-6" onSubmit={onSubmit}>
            {children}
          </form>
        </div>
      </div>
      
      <div className="mt-10 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} PointMe. All rights reserved.</p>
      </div>
    </div>
  );
} 