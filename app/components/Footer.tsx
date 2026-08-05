import {NavLink, Link} from 'react-router';
import type {HeaderQuery} from 'storefrontapi.generated';
import {InstagramIcon, TiktokIcon} from '~/components/Icons';
import {INSTAGRAM_URL} from '~/lib/social';
import {Newsletter} from '~/components/Newsletter';

interface FooterProps {
  header: HeaderQuery;
}

const INFO_LINKS = [
  {title: 'track my order', to: '/order-tracking'},
  {title: 'faq', to: '/faq'},
  {title: 'our story', to: '/about'},
  {title: 'contact', to: '/contact'},
];

/*
 * These point at the storefront's own documents under /legal, not at Shopify
 * Admin's policy pages: the text lives in the repo, and Shopify has no slot at
 * all for a legal notice. See docs/legal-pages.md.
 */
const POLICY_LINKS = [
  {title: 'shipping', to: '/legal/shipping'},
  {title: 'returns & refunds', to: '/legal/returns'},
  {title: 'terms & conditions', to: '/legal/terms'},
  {title: 'privacy', to: '/legal/privacy'},
  {title: 'legal notice', to: '/legal/legal-notice'},
];

export function Footer({header}: FooterProps) {
  const shopName = header?.shop?.name ?? 'reda studio';
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">
            {shopName.toLowerCase()}
          </Link>
          <p className="site-footer__blurb">
            an independent streetwear house &mdash; premium, minimalist
            pieces made to last. fast delivery across france.
          </p>
          <div className="site-footer__social">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TiktokIcon />
            </a>
          </div>
        </div>

        <nav className="site-footer__col" aria-label="Informations">
          <h3 className="site-footer__col-title">informations</h3>
          <ul>
            {INFO_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} prefetch="intent">
                  {link.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__col" aria-label="Shipping and policies">
          <h3 className="site-footer__col-title">shipping &amp; policies</h3>
          <ul>
            {POLICY_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} prefetch="intent">
                  {link.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col site-footer__newsletter">
          <h3 className="site-footer__col-title">newsletter</h3>
          <Newsletter />
        </div>
      </div>

      <div className="site-footer__bottom">
        <span className="site-footer__copy">
          © {year} {shopName.toLowerCase()}
        </span>
      </div>
    </footer>
  );
}
