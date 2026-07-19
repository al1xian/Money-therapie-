import {createContext, useContext, useEffect, useRef, useState} from 'react';

type HeaderToneContextValue = {
  transparent: boolean;
  setTransparent: (value: boolean) => void;
};

const HeaderToneContext = createContext<HeaderToneContextValue | null>(null);

export function HeaderToneProvider({children}: {children: React.ReactNode}) {
  const [transparent, setTransparent] = useState(false);
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
