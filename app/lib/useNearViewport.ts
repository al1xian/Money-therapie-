import {useEffect, useRef, useState} from 'react';

/** True once the element has scrolled near the viewport — used to defer
 * mounting heavier media (e.g. product videos) until they're about to be
 * seen, same IntersectionObserver approach as ~/components/Reveal. */
export function useNearViewport<T extends HTMLElement>(margin = '200px') {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      {rootMargin: margin},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [margin]);

  return {ref, near};
}
