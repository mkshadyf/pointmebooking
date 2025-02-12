import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type StoreSlice = {
  [key: string]: unknown;
};

// Logger middleware
export const logger: Logger = (f, name) => (set, get, store) => {
  
  const loggedSet: typeof set = (...a) => {
    const before = get();
    set(...a);
    const after = get();
    
    // Log only if there are actual changes
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      console.group(
        `%c${name || 'Store'} %c${new Date().toLocaleTimeString()}`,
        'color: #3b82f6; font-weight: bold;',
        'color: gray; font-weight: normal;'
      );
      console.log('Prev:', before);
      console.log('Next:', after);
      console.log('Action:', a[0]);
      console.groupEnd();
    }
  };

  return f(loggedSet, get, store);
};

// Performance tracking middleware
export const performanceTracker = <T extends StoreSlice>(
  f: StateCreator<T>
): StateCreator<T> => (set, get, store) => {
  const trackedSet: typeof set = (...a) => {
    const start = performance.now();
    set(...a);
    const end = performance.now();
    
    const duration = end - start;
    if (duration > 16.67) { // Warn if update takes longer than one frame (60fps)
      console.warn(
        `Store update took ${duration.toFixed(2)}ms. Consider optimizing the update.`,
        a[0]
      );
    }
  };

  return f(trackedSet, get, store);
};

// Persistence middleware with versioning
export const createPersistMiddleware = <T extends StoreSlice>(
  key: string,
  version: number = 1,
  migrations?: Record<number, (state: any) => any>
) => {
  return (f: StateCreator<T>): StateCreator<T> =>
    (set, get, store) => {

      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const { state: storedState, version: storedVersion } = JSON.parse(stored);
          
          // Apply migrations if needed
          if (storedVersion < version && migrations) {
            let migratedState = storedState;
            for (let v = storedVersion; v < version; v++) {
              if (migrations[v]) {
                migratedState = migrations[v](migratedState);
              }
            }
          } else {
          }
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
      }

      const persistedSet: typeof set = (...a) => {
        set(...a);
        try {
          localStorage.setItem(
            key,
            JSON.stringify({
              state: get(),
              version,
            })
          );
        } catch (error) {
          console.error('Failed to persist state:', error);
        }
      };

      return f(persistedSet, get, store);
    };
};

// Error boundary middleware
export const errorBoundary = <T extends StoreSlice>(
  f: StateCreator<T>
): StateCreator<T> => (set, get, store) => {
  const handleError = (error: unknown) => {
    console.error('Store update failed:', error);
    // You can add error reporting service here
  };

  const boundSet: typeof set = (...a) => {
    try {
      set(...a);
    } catch (error) {
      handleError(error);
    }
  };

  return f(boundSet, get, store);
}; 