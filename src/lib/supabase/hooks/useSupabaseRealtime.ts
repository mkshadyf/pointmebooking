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
          .on(
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
              
              if (onData) {
                onData(newData);
              }
            }
          )
          .subscribe((status: string) => {
            if (status !== 'SUBSCRIBED' || !isSubscribed) return;
            
            console.log(`Subscribed to ${table} changes`);
          });
      } catch (err) {
        console.error('Error setting up realtime subscription:', err);
        
        if (isSubscribed) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          
          if (onError) {
            onError(error);
          }
        }
      }
    };
    
    setupRealtime();
    
    const cleanup = () => {
      isSubscribed = false;
      
      if (channel) {
        try {
          channel.unsubscribe();
          console.log(`Unsubscribed from ${table} changes`);
        } catch (err) {
          console.error('Error unsubscribing from channel:', err);
        }
      }
    };
    
    return cleanup;
  }, [table, event, filter, onData, onError]);
  
  return { data, error };
}

export default useSupabaseRealtime;

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