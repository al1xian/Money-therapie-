import {useEffect, useRef, useState} from 'react';

/**
 * Wraps children in a container that fades + slides up the first time it
 * scrolls into view. Respects prefers-reduced-motion via the CSS (the
 * .reveal transition is neutralised there).
 */
export function Reveal({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'li';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {threshold: 0.08, rootMargin: '0px 0px -40px 0px'},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
