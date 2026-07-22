import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useId,
} from 'react';
import {CloseIcon} from '~/components/Icons';

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

  useEffect(() => {
    const abortController = new AbortController();
    if (expanded) {
      document.addEventListener(
        'keydown',
        (event: KeyboardEvent) => {
          if (event.key === 'Escape') close();
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
      aria-labelledby={id}
    >
      <button className="close-outside" onClick={close} aria-label="Fermer" />
      <aside className="drawer">
        <header className="drawer__header">
          <h3 id={id} className="drawer__heading">
            {heading}
          </h3>
          <button className="drawer__close" onClick={close} aria-label="Fermer">
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
