'use client';

import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../client';

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
    const channel = supabase
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
          const newData = payload.new as T;
          setData(newData);
          onData?.(newData);
        }
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIPTION_ERROR') {
          const error = new Error('Realtime subscription error');
          setError(error);
          onError?.(error);
        }
      });

    return () => {
      supabase.removeChannel(channel);
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
//     filterValue: 'some-business-id',
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