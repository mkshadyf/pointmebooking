'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!loading && user) {
      const redirectPath = user.role === 'business' 
                         ? '/dashboard/business' 
                         : '/dashboard/customer';
      router.replace(redirectPath);
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center space-y-6">
          <Image
            src="/logo.svg"
            alt="PointMe"
            width={160}
            height={60}
            className="h-16 w-auto"
            priority
          />
          <div className="w-full bg-white shadow-xl rounded-2xl px-6 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}