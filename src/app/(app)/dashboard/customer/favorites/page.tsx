'use client';

import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/hooks/auth/useAuth';
import { useEffect, useState } from 'react';

export default function CustomerFavoritesPage() {
  const { user, isLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;

    // In a real implementation, you would fetch customer favorites
    // For now, we're just simulating loading state
    const timer = setTimeout(() => {
      setFavorites([]);
      setIsLoadingData(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Favorites</h1>
      </div>

      <Card className="p-6">
        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : favorites.length > 0 ? (
          <div>
            {/* Favorites list would go here */}
            <p>You have {favorites.length} favorited services</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="font-medium text-lg">No favorites yet</h3>
            <p className="text-sm text-gray-500 mt-2">
              You haven't added any services to your favorites list.
            </p>
            <div className="mt-4">
              <a
                href="/services"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Discover Services
              </a>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 