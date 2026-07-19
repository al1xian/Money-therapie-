import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useHeaderTone} from '~/components/HeaderTone';
import {AccountIcon, BagIcon, MenuIcon, SearchIcon} from '~/components/Icons';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({header, isLoggedIn, cart}: HeaderProps) {
  const {shop} = header;
  const {transparent} = useHeaderTone();

  return (
    <header
      className={`site-header ${transparent ? 'site-header--transparent' : 'site-header--solid'}`}
    >
      <div className="site-header__side site-header__side--start">
        <MobileMenuToggle />
      </div>

      <NavLink to="/" end className="site-header__logo" prefetch="intent">
        {shop.name}
      </NavLink>

      <div className="site-header__side site-header__side--end">
        <NavLink to="/account" className="site-header__icon-link" aria-label="Compte">
          <Suspense fallback={<AccountIcon />}>
            <Await resolve={isLoggedIn} errorElement={<AccountIcon />}>
              {() => <AccountIcon />}
            </Await>
          </Suspense>
        </NavLink>
        <SearchToggle />
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

  return (
    <nav className="side-nav__primary" role="navigation">
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="side-nav__link"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function MobileMenuToggle() {
  const {open} = useAside();
  return (
    <button
      className="site-header__icon-btn"
      onClick={() => open('mobile')}
      aria-label="Ouvrir le menu"
    >
      <MenuIcon />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="site-header__icon-btn"
      onClick={() => open('search')}
      aria-label="Rechercher"
    >
      <SearchIcon />
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="site-header__icon-btn site-header__icon-btn--cart"
      aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}
      onClick={(e) => {
        e.preventDefault();
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

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(resolvedCart) => <CartBanner cart={resolvedCart} />}
      </Await>
    </Suspense>
  );
}

function CartBanner({cart: originalCart}: {cart: CartApiQueryFragment | null}) {
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

export const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Toutes les collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: "L'histoire",
      type: 'HTTP',
      url: '/histoire',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Contact',
      type: 'HTTP',
      url: '/contact',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: null,
      tags: [],
      title: 'Suivi de commande',
      type: 'HTTP',
      url: '/account/orders',
      items: [],
    },
  ],
};
