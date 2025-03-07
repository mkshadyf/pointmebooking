'use client';

import { RefObject, useEffect, useRef, useState } from 'react';

export interface IntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends Element = Element>(
  elementRef: RefObject<T>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
    triggerOnce = false,
  }: IntersectionObserverOptions = {},
): {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
  frozen: boolean;
} {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [frozen, setFrozen] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node || frozen) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);

      if (entry?.isIntersecting) {
        if (triggerOnce) {
          // Disconnect after first intersection
          observer.disconnect();
        }

        if (freezeOnceVisible) {
          setFrozen(true);
        }
      }
    }, observerParams);

    observer.observe(node);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, threshold, root, rootMargin, frozen, freezeOnceVisible, triggerOnce]);

  return {
    isIntersecting: entry?.isIntersecting ?? false,
    entry,
    frozen,
  };
}

// Example usage:
// const MyComponent = () => {
//   const ref = useRef<HTMLDivElement>(null);
//   const { isIntersecting } = useIntersectionObserver(ref, {
//     threshold: 0.5,
//     triggerOnce: true,
//   });
//
//   return (
//     <div ref={ref}>
//       {isIntersecting ? 'Visible' : 'Not visible'}
//     </div>
//   );
// }; 