import {Suspense} from 'react';
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
  const {transparent, scrolled} = useHeaderTone();

  const headerClassName = [
    'site-header',
    transparent && 'site-header--transparent',
    scrolled && 'site-header--scrolled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClassName}>
      <button
        className="site-header__icon-btn site-header__burger"
        onClick={() => open('mobile')}
        aria-label="Ouvrir le menu"
      >
        <BurgerIcon />
      </button>

      <NavLink to="/" end prefetch="intent" className="site-header__logo">
        {shop.name}
      </NavLink>

      <HeaderMenu collections={navCollections} viewport="desktop" />

      <div className="site-header__end">
        <span className="site-header__currency">EUR</span>
        <button
          className="site-header__icon-btn"
          onClick={() => open('search')}
          aria-label="Rechercher"
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
          accueil
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
      aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}
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
