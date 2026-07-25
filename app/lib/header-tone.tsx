import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {useLocation} from 'react-router';

type HeaderToneContextValue = {
  transparent: boolean;
  setTransparent: (value: boolean) => void;
  /** True once the page has scrolled past the very top — drives hiding the
   * marquee and shifting the fixed header up to replace it (see Marquee.tsx
   * and .site-header--scrolled in app.css). */
  scrolled: boolean;
};

const HeaderToneContext = createContext<HeaderToneContextValue | null>(null);

/**
 * Tracks whether the header should render in its transparent/glass state
 * (only ever true while the homepage hero is in view — see AnimatedHero's
 * IntersectionObserver) or its default solid white/black state everywhere
 * else. Resets to solid on every route change so a lingering transparent
 * state never follows the user onto a page without a hero. Also tracks
 * page-scroll position once, here, so Marquee and Header don't each need
 * their own scroll listener.
 */
export function HeaderToneProvider({children}: {children: ReactNode}) {
  const [transparent, setTransparent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const {pathname} = useLocation();

  useEffect(() => {
    setTransparent(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <HeaderToneContext.Provider value={{transparent, setTransparent, scrolled}}>
      {children}
    </HeaderToneContext.Provider>
  );
}

export function useHeaderTone() {
  const ctx = useContext(HeaderToneContext);
  if (!ctx) throw new Error('useHeaderTone must be used within HeaderToneProvider');
  return ctx;
}
