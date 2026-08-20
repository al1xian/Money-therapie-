import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useId,
} from 'react';
import {CloseIcon} from '~/components/Icons';
import {lockScroll, unlockScroll} from '~/lib/scrollLock';
import {useT} from '~/lib/i18n';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * Right-side drawer with dimmed overlay. Closes on Escape and on
 * outside click. Used for cart, search and mobile menu.
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  const t = useT();

  useEffect(() => {
    if (!expanded) return;

    const abortController = new AbortController();
    document.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') close();
      },
      {signal: abortController.signal},
    );

    /*
     * The page behind the drawer used to keep scrolling: reaching the bottom
     * of the cart and carrying on would drag the homepage along underneath it.
     * The lock measures what it costs the layout and gives it straight back,
     * so opening a drawer moves nothing — see app/lib/scrollLock.ts.
     */
    lockScroll();

    return () => {
      abortController.abort();
      unlockScroll();
    };
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
      aria-labelledby={id}
    >
      <button className="close-outside" onClick={close} aria-label={t('nav.close')} />
      <aside className="drawer">
        <header className="drawer__header">
          <h3 id={id} className="drawer__heading">
            {heading}
          </h3>
          <button className="drawer__close" onClick={close} aria-label={t('nav.close')}>
            <CloseIcon />
          </button>
        </header>
        <div className="drawer__main">{children}</div>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
