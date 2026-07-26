import {NavLink, Link} from 'react-router';
import type {HeaderQuery} from 'storefrontapi.generated';
import type {NavCollection} from '~/components/Header';
import {InstagramIcon, TiktokIcon} from '~/components/Icons';
import {Newsletter} from '~/components/Newsletter';

interface FooterProps {
  header: HeaderQuery;
  navCollections: NavCollection[];
}

const INFO_LINKS = [
  {title: 'faq', to: '/faq'},
  {title: 'notre histoire', to: '/about'},
  {title: 'contact', to: '/contact'},
];

const POLICY_LINKS = [
  {title: 'livraison', to: '/policies/shipping-policy'},
  {title: 'retours', to: '/policies/refund-policy'},
  {title: 'cgv & mentions légales', to: '/policies/terms-of-service'},
  {title: 'confidentialité', to: '/policies/privacy-policy'},
];

export function Footer({header, navCollections}: FooterProps) {
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
            maison streetwear indépendante — pièces premium, minimalistes,
            pensées pour durer. livraison rapide partout en france.
          </p>
          <div className="site-footer__social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TiktokIcon />
            </a>
          </div>
        </div>

        {navCollections.length > 0 && (
          <nav className="site-footer__col" aria-label="Collections">
            <h3 className="site-footer__col-title">collections</h3>
            <ul>
              {navCollections.map((collection) => (
                <li key={collection.id}>
                  <NavLink to={`/collections/${collection.handle}`} prefetch="intent">
                    {collection.title.toLowerCase()}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

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

        <nav className="site-footer__col" aria-label="Livraison et politiques">
          <h3 className="site-footer__col-title">livraison &amp; politiques</h3>
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
