import {NavLink} from 'react-router';
import type {HeaderQuery} from 'storefrontapi.generated';
import {InstagramIcon, TiktokIcon} from '~/components/Icons';

interface FooterProps {
  header: HeaderQuery;
}

const FOOTER_LINKS = [
  {title: 'livraison', to: '/policies/shipping-policy'},
  {title: 'retours', to: '/policies/refund-policy'},
  {title: 'cgv', to: '/policies/terms-of-service'},
  {title: 'confidentialité', to: '/policies/privacy-policy'},
];

export function Footer({header}: FooterProps) {
  const shopName = header?.shop?.name ?? 'money therapy';
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <span className="site-footer__copy">
        © {year} {shopName.toLowerCase()}
      </span>

      <nav className="site-footer__links" aria-label="Liens légaux">
        {FOOTER_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} prefetch="intent">
            {link.title}
          </NavLink>
        ))}
      </nav>

      <div className="site-footer__social">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <InstagramIcon />
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
          <TiktokIcon />
        </a>
      </div>
    </footer>
  );
}
