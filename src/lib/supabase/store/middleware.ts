import { StateCreator, StoreApi } from 'zustand';
import { PersistOptions, persist } from 'zustand/middleware';



export const logger = <T extends object>(
  config: StateCreator<T, [], []>,
  name?: string
): StateCreator<T, [], []> => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    if (name) console.log(`${name}: applying`, ...args);
    set(...args);
    if (name) console.log(`${name}: new state`, get());
  };
  return config(loggedSet, get, store);
};

export const errorBoundary = <T extends object>(
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => (set, get, store) => {
  const handleError = (error: Error) => {
    console.error('Store error:', error);
    // You can add error reporting here
  };

  return config(
    (...args) => {
      try {
        return set(...args);
      } catch (error) {
        handleError(error as Error);
        throw error;
      }
    },
    get,
    store
  );
};

export const performanceTracker = <T extends object>(
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => (set, get, store) => {
  return config(
    (...args) => {
      const start = performance.now();
      const result = set(...args);
      const end = performance.now();
      console.log(`State update took ${end - start}ms`);
      return result;
    },
    get,
    store
  );
};

export const createPersistMiddleware = <T extends object>(
  name: string,
  version: number
) => {
  const persistConfig: PersistOptions<T> = {
    name,
    version,
    partialize: (state) => state,
  };

  return (config: StateCreator<T, [], []>) =>
    persist(config, persistConfig);
}; 