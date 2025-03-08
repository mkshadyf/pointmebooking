/**
 * @deprecated This hook is deprecated. Use the hook from '@/hooks/core/usePrevious' instead.
 * This will be removed in a future version.
 */

import { usePrevious as usePreviousCore } from './core/usePrevious';

/**
 * @deprecated Use usePrevious from '@/hooks/core' instead.
 */
export function usePrevious<T>(value: T): T | undefined {
  console.warn(
    'usePrevious from @/hooks root is deprecated. ' +
    'Please use usePrevious from @/hooks/core instead. ' +
    'This hook will be removed in a future version.'
  );
  
  return usePreviousCore(value);
}

export default usePrevious;

// Example usage:
// const MyComponent = () => {
//   const [count, setCount] = useState(0);
//   const prevCount = usePrevious(count);
//
//   return (
//     <div>
//       <p>Current: {count}</p>
//       <p>Previous: {prevCount}</p>
//       <button onClick={() => setCount(c => c + 1)}>Increment</button>
//     </div>
//   );
// }; 