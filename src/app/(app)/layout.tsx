'use client';

import MainNav from '@/components/navigation/MainNav';
import { useAuth } from '@/context/AuthContext';
import { PageLoading } from '@/components/ui/Loading';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main>{children}</main>
    </div>
  );
}
