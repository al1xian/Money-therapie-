import {Suspense, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useHeaderTone} from '~/lib/header-tone';
import {BagIcon, BurgerIcon, SearchIcon} from '~/components/Icons';

export type NavCollection = {id: string; title: string; handle: string};

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  navCollections: NavCollection[];
}

type Viewport = 'desktop' | 'mobile';

export function Header({header, cart, navCollections}: HeaderProps) {
  const {shop} = header;
  const {open} = useAside();
  const {transparent} = useHeaderTone();
  // Drives a short press animation on the wordmark; cleared on animation end
  // so it can replay on every click.
  const [logoPressed, setLogoPressed] = useState(false);

  const headerClassName = [
    'site-header',
    transparent && 'site-header--transparent',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClassName}>
      {/* Three tracks — left, centre, right — so the wordmark is optically
          centred in the header whatever the nav or icons weigh. */}
      <div className="site-header__side site-header__side--start">
        <button
          className="site-header__icon-btn site-header__burger"
          onClick={() => open('mobile')}
          aria-label="Open menu"
        >
          <BurgerIcon />
        </button>
        <HeaderMenu collections={navCollections} viewport="desktop" />
      </div>

      <NavLink
        to="/"
        end
        prefetch="intent"
        className={`site-header__logo ${logoPressed ? 'site-header__logo--pressed' : ''}`}
        aria-label={shop.name}
        onClick={() => setLogoPressed(true)}
        onAnimationEnd={() => setLogoPressed(false)}
      >
        {/* The wordmark is painted with currentColor through a CSS mask, so it
            turns white by itself when the header goes transparent over the
            hero. The text stays for screen readers and as a fallback. */}
        <span className="site-header__wordmark" aria-hidden="true" />
        <span className="sr-only">{shop.name}</span>
      </NavLink>

      <div className="site-header__side site-header__side--end">
        <span className="site-header__currency">EUR</span>
        <button
          className="site-header__icon-btn"
          onClick={() => open('search')}
          aria-label="Search"
        >
          <SearchIcon />
        </button>
        <CartToggle cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  collections,
  viewport,
}: {
  collections: NavCollection[];
  viewport: Viewport;
}) {
  const {close} = useAside();
  const className = viewport === 'desktop' ? 'site-header__nav' : 'mobile-nav';

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink to="/" end onClick={close} prefetch="intent">
          home
        </NavLink>
      )}
      {collections.map((collection) => (
        <NavLink
          className={viewport === 'desktop' ? 'site-header__nav-link' : undefined}
          key={collection.id}
          to={`/collections/${collection.handle}`}
          onClick={close}
          prefetch="intent"
        >
          {collection.title.toLowerCase()}
        </NavLink>
      ))}
      {/* Service links sit under the collections rather than among them, and
          only on mobile: the desktop bar stays a list of what's for sale. */}
      {viewport === 'mobile' && (
        <NavLink
          to="/order-tracking"
          className="mobile-nav__service"
          onClick={close}
          prefetch="intent"
        >
          track my order
        </NavLink>
      )}
    </nav>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartButton count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartButton count={cart?.totalQuantity ?? 0} />;
}

function CartButton({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <button
      className="site-header__icon-btn"
      aria-label={`Cart, ${count} item${count > 1 ? 's' : ''}`}
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <BagIcon />
      {count > 0 && <span className="site-header__cart-count">{count}</span>}
    </button>
  );
}
