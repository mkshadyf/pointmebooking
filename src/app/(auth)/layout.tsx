'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "@/components/ui/Loading";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'business' ? '/dashboard/business' : '/dashboard/customer');
    }
  }, [user, loading, router]);

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="PointMe!"
            width={180}
            height={60}
            className="mb-8"
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
