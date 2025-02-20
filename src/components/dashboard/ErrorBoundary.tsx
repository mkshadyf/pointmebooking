'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ErrorBoundary({ error }: { error: Error }) {
  const router = useRouter();

  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-gray-500">{error.message}</p>
      <Button onClick={() => router.refresh()}>Try Again</Button>
    </div>
  );
} 