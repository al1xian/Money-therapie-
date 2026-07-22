import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {BagIcon, BurgerIcon, SearchIcon} from '~/components/Icons';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({header, cart, publicStoreDomain}: HeaderProps) {
  const {shop, menu} = header;
  const {open} = useAside();

  return (
    <header className="site-header">
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

      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />

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
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const className =
    viewport === 'desktop' ? 'site-header__nav' : 'mobile-nav';

  const items = menu?.items?.length ? menu.items : FALLBACK_HEADER_MENU.items;

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink to="/" end onClick={close} prefetch="intent">
          accueil
        </NavLink>
      )}
      {items.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className={viewport === 'desktop' ? 'site-header__nav-link' : undefined}
            key={item.id}
            to={url}
            onClick={close}
            prefetch="intent"
          >
            {item.title.toLowerCase()}
          </NavLink>
        );
      })}
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

export const FALLBACK_HEADER_MENU = {
  id: 'fallback-menu',
  items: [
    {id: 'm1', resourceId: null, tags: [], title: 'shop', type: 'HTTP', url: '/collections/all', items: []},
    {id: 'm2', resourceId: null, tags: [], title: 'about', type: 'HTTP', url: '/about', items: []},
    {id: 'm3', resourceId: null, tags: [], title: 'lookbook', type: 'HTTP', url: '/lookbook', items: []},
    {id: 'm4', resourceId: null, tags: [], title: 'contact', type: 'HTTP', url: '/contact', items: []},
  ],
};
