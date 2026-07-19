import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {LockIcon} from '~/components/Icons';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

const INFO_LINKS = [
  {title: 'Contact', to: '/contact'},
  {title: 'FAQ', to: '/faq'},
  {title: 'Livraison', to: '/policies/shipping-policy'},
  {title: 'Retours & échanges', to: '/policies/refund-policy'},
  {title: 'Suivi de commande', to: '/account/orders'},
  {title: 'Guide des tailles', to: '/guide-des-tailles'},
];

const LEGAL_LINKS = [
  {title: 'CGV', to: '/policies/terms-of-service'},
  {title: 'Confidentialité', to: '/policies/privacy-policy'},
  {title: 'Mentions légales', to: '/mentions-legales'},
];

export function Footer({footer: footerPromise, header, publicStoreDomain}: FooterProps) {
  const shopName = header?.shop?.name ?? 'Money Therapy';
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <span className="site-footer__wordmark">{shopName}</span>
          <p className="site-footer__tagline">
            Streetwear premium, direction éditoriale, pièces pensées pour durer.
          </p>
        </div>

        <FooterColumn title="Collections">
          <Suspense>
            <Await resolve={footerPromise}>
              {(footer) => (
                <FooterMenuLinks
                  menu={footer?.menu}
                  header={header}
                  publicStoreDomain={publicStoreDomain}
                />
              )}
            </Await>
          </Suspense>
        </FooterColumn>

        <FooterColumn title="Informations">
          {INFO_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} prefetch="intent">
              {link.title}
            </NavLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Légal">
          {LEGAL_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} prefetch="intent">
              {link.title}
            </NavLink>
          ))}
        </FooterColumn>
      </div>

      <div className="site-footer__bottom">
        <p className="site-footer__payment">
          <LockIcon className="site-footer__payment-icon" />
          Paiement sécurisé par carte bancaire
        </p>
        <p className="site-footer__copyright">
          © {year} {shopName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <nav className="site-footer__column" aria-label={title}>
      <h3 className="site-footer__column-title">{title}</h3>
      <div className="site-footer__column-links">{children}</div>
    </nav>
  );
}

function FooterMenuLinks({
  menu,
  header,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'] | undefined;
  header: HeaderQuery;
  publicStoreDomain: string;
}) {
  const primaryDomainUrl = header?.shop?.primaryDomain?.url;
  const items = menu?.items?.length ? menu.items : FALLBACK_FOOTER_MENU.items;

  return (
    <>
      {items.map((item) => {
        if (!item.url) return null;
        const url =
          primaryDomainUrl &&
          (item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl))
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink key={item.id} prefetch="intent" to={url}>
            {item.title}
          </NavLink>
        );
      })}
    </>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/fallback-footer',
  items: [
    {
      id: 'fallback-all',
      resourceId: null,
      tags: [],
      title: 'Toutes les collections',
      type: 'HTTP',
      url: '/collections/all',
      items: [],
    },
  ],
};
