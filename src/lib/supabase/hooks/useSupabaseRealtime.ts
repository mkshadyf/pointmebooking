'use client';

import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabaseClientService } from '../services/core/supabase-client.service';

export interface RealtimeOptions<T extends Record<string, any>> {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onData?: (payload: T) => void;
  onError?: (error: Error) => void;
}

export function useSupabaseRealtime<T extends Record<string, any>>({
  table,
  event = '*',
  filter,
  onData,
  onError,
}: RealtimeOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: any = null;
    let isSubscribed = true;

    const setupRealtime = async () => {
      try {
        // Get the client
        const client = await supabaseClientService.getBrowserClient();
        
        // Create and subscribe to the channel
        channel = client
          .channel('realtime')
          .on<T>(
            'postgres_changes' as any,
            {
              event,
              schema: 'public',
              table,
              filter,
            },
            (payload: RealtimePostgresChangesPayload<T>) => {
              if (!isSubscribed) return;
              const newData = payload.new as T;
              setData(newData);
              onData?.(newData);
            }
          )
          .subscribe((status: any) => {
            if (!isSubscribed) return;
            if (status === 'SUBSCRIPTION_ERROR') {
              const subscriptionError = new Error('Realtime subscription error');
              setError(subscriptionError);
              onError?.(subscriptionError);
            }
          });
      } catch (err) {
        if (!isSubscribed) return;
        const setupError = err instanceof Error ? err : new Error('Failed to setup realtime subscription');
        setError(setupError);
        onError?.(setupError);
      }
    };

    setupRealtime();

    return () => {
      isSubscribed = false;
      
      // Clean up the channel if it exists
      if (channel) {
        const cleanup = async () => {
          try {
            const client = await supabaseClientService.getBrowserClient();
            client.removeChannel(channel);
          } catch (err) {
            console.error('Error removing channel:', err);
          }
        };
        
        cleanup();
      }
    };
  }, [table, event, filter, onData, onError]);

  return { data, error };
}

// Example usage:
// const MyComponent = () => {
//   useSupabaseRealtime({
//     table: 'bookings',
//     event: 'INSERT',
//     filter: 'business_id',
//     onData: (payload) => {
//       console.log('New booking:', payload);
//     },
//     onError: (error) => {
//       console.error('Subscription error:', error);
//     },
//   });
//
//   return <div>Listening for new bookings...</div>;
// }; 