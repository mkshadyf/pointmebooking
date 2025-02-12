'use client';

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useEffect, useRef } from 'react';
import { supabase } from '../client';
import { Database } from '../types/database';

type Table = keyof Database['public']['Tables'];
type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface UseSupabaseRealtimeOptions<T extends Table> {
  table: T;
  event?: Event;
  filter?: string;
  filterValue?: string | number | boolean;
  onData?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onError?: (error: Error) => void;
}

export function useSupabaseRealtime<T extends Table>({
  table,
  event = '*',
  filter,
  filterValue,
  onData,
  onError,
}: UseSupabaseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create channel with unique name
    const channelName = `${table}:${event}${filter ? `:${filter}=${filterValue}` : ''}`;
    let channel = supabase.channel(channelName);

    // Add filters if provided
    let subscription = channel.on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        ...(filter && filterValue ? { filter: `${filter}=eq.${filterValue}` } : {}),
      },
      (payload) => {
        try {
          onData?.(payload as RealtimePostgresChangesPayload<T>);
        } catch (error) {
          onError?.(error as Error);
        }
      }
    );

    // Subscribe to channel
    subscription = subscription.subscribe((_status, err) => {
      if (err) {
        onError?.(err);
      }
    });

    // Store channel reference
    channelRef.current = channel;

    // Cleanup subscription
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, event, filter, filterValue, onData, onError]);

  return {
    unsubscribe: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    },
  };
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