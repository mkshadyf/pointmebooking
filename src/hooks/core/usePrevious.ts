'use client';

import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

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