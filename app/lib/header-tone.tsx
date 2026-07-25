import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {useLocation} from 'react-router';

type HeaderToneContextValue = {
  transparent: boolean;
  setTransparent: (value: boolean) => void;
};

const HeaderToneContext = createContext<HeaderToneContextValue | null>(null);

/**
 * Tracks whether the header should render in its transparent/glass state
 * (only ever true while the homepage hero is in view — see AnimatedHero's
 * IntersectionObserver) or its default solid white/black state everywhere
 * else. Resets to solid on every route change so a lingering transparent
 * state never follows the user onto a page without a hero.
 */
export function HeaderToneProvider({children}: {children: ReactNode}) {
  const [transparent, setTransparent] = useState(false);
  const {pathname} = useLocation();

  useEffect(() => {
    setTransparent(false);
  }, [pathname]);

  return (
    <HeaderToneContext.Provider value={{transparent, setTransparent}}>
      {children}
    </HeaderToneContext.Provider>
  );
}

export function useHeaderTone() {
  const ctx = useContext(HeaderToneContext);
  if (!ctx) throw new Error('useHeaderTone must be used within HeaderToneProvider');
  return ctx;
}
