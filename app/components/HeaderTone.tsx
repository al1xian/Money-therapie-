import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router';

type HeaderToneContextValue = {
  transparent: boolean;
  setTransparent: (value: boolean) => void;
};

const HeaderToneContext = createContext<HeaderToneContextValue | null>(null);

export function HeaderToneProvider({children}: {children: React.ReactNode}) {
  const {pathname} = useLocation();
  const isHome = pathname === '/';
  // Bug fix: initializing this to a hardcoded `false` made the homepage
  // header render solid/white for one frame on first load and on every
  // client-side navigation back to "/", before the hero's own effect had a
  // chance to flip it — a visible flash. Seeding it from the route (which
  // is known during SSR too) avoids that; the hero's IntersectionObserver
  // still takes over for scroll-based refinement once mounted.
  const [transparent, setTransparent] = useState(isHome);

  useEffect(() => {
    setTransparent(isHome);
  }, [isHome]);

  return (
    <HeaderToneContext.Provider value={{transparent, setTransparent}}>
      {children}
    </HeaderToneContext.Provider>
  );
}

export function useHeaderTone() {
  const ctx = useContext(HeaderToneContext);
  if (!ctx) {
    throw new Error('useHeaderTone must be used within a HeaderToneProvider');
  }
  return ctx;
}

/**
 * Renders nothing. Watches a sentinel placed near the bottom of the hero and
 * flips the header to its transparent/light-on-dark state while the hero is
 * still on screen. Only mount this inside the homepage hero.
 */
export function HeroHeaderSentinel() {
  const {setTransparent} = useHeaderTone();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTransparent(true);
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setTransparent(entry.isIntersecting),
      {rootMargin: '-88px 0px 0px 0px', threshold: 0},
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      setTransparent(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} aria-hidden="true" className="pointer-events-none h-px w-full" />;
}
