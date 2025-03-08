/**
 * @deprecated This hook is deprecated. Use the hook from '@/hooks/core/useLocalStorage' instead.
 * This will be removed in a future version.
 */

import { useLocalStorage as useLocalStorageCore } from './core/useLocalStorage';

/**
 * @deprecated Use useLocalStorage from '@/hooks/core' instead.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  console.warn(
    'useLocalStorage from @/hooks root is deprecated. ' +
    'Please use useLocalStorage from @/hooks/core instead. ' +
    'This hook will be removed in a future version.'
  );
  
  return useLocalStorageCore(key, initialValue);
}

export default useLocalStorage; 