import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  HomeCollectionsQuery,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import {HeroHeaderSentinel} from '~/components/HeaderTone';
import {
  ArrowRightIcon,
  HeadsetIcon,
  LockIcon,
  ReturnIcon,
  TruckIcon,
} from '~/components/Icons';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(HOME_COLLECTIONS_QUERY),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    collections: collections.nodes,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {recommendedProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero />
      <CategoryShop
        collections={data.collections}
        products={data.recommendedProducts}
      />
      <EditorialCollections collections={data.collections} />
      <BrandStory />
      <Reassurance />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero__media" aria-hidden="true">
        {/* hero-desktop-placeholder — replace with the real campaign visual (desktop) */}
        {/* hero-mobile-placeholder — a cropped/vertical version can be swapped in via CSS below this breakpoint */}
      </div>
      <div className="hero__content">
        <p className="hero__eyebrow">Nouvelle collection</p>
        <h1 className="hero__title">Money Therapy</h1>
        <p className="hero__subtitle">
          Streetwear premium — pièces éditoriales pensées pour durer.
        </p>
        <Link to="/collections/all" className="btn btn--ghost-light">
          Découvrir
        </Link>
      </div>
      <HeroHeaderSentinel />
    </section>
  );
}

function CategoryShop({
  collections,
  products,
}: {
  collections: HomeCollectionsQuery['collections']['nodes'];
  products: Promise<RecommendedProductsQuery | null>;
}) {
  // Only ever link to collections that really exist in the store, plus the
  // built-in "all products" route — never a guessed/hardcoded handle.
  const tabs = [
    {title: 'Tout', handle: 'all'},
    ...collections.slice(0, 6).map((c) => ({title: c.title, handle: c.handle})),
  ];

  return (
    <section className="category-shop" aria-labelledby="category-shop-heading">
      <div className="category-shop__head">
        <h2 id="category-shop-heading" className="sr-only">
          Découvrir les produits
        </h2>
        <nav className="category-tabs" aria-label="Catégories">
          {tabs.map((tab, index) => (
            <Link
              key={tab.handle}
              to={`/collections/${tab.handle}`}
              prefetch="intent"
              className={`category-tabs__item ${index === 0 ? 'category-tabs__item--active' : ''}`}
            >
              {tab.title}
            </Link>
          ))}
        </nav>
      </div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <Await resolve={products}>
          {(response) => (
            <div className="product-grid">
              {response
                ? response.products.nodes.map((product, index) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      loading={index < 4 ? 'eager' : undefined}
                    />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <div className="category-shop__more">
        <Link to="/collections/all" className="btn btn--outline">
          Voir tout
        </Link>
      </div>
    </section>
  );
}

const SKELETON_KEYS = Array.from({length: 10}, (_, i) => `skeleton-${i}`);

function ProductGridSkeleton() {
  return (
    <div className="product-grid" aria-hidden="true">
      {SKELETON_KEYS.map((key) => (
        <div key={key} className="product-card product-card--skeleton" />
      ))}
    </div>
  );
}

function EditorialCollections({
  collections,
}: {
  collections: HomeCollectionsQuery['collections']['nodes'];
}) {
  const blocks = collections.slice(0, 4);
  if (blocks.length === 0) return null;

  return (
    <section className="editorial-grid" aria-labelledby="editorial-heading">
      <h2 id="editorial-heading" className="sr-only">
        Collections éditoriales
      </h2>
      <div className="editorial-grid__row">
        {blocks.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className="editorial-block"
          >
            {collection.image ? (
              <Image
                data={collection.image}
                alt={collection.image.altText || collection.title}
                sizes="(min-width: 64em) 25vw, (min-width: 45em) 50vw, 100vw"
                className="editorial-block__image"
              />
            ) : (
              <div className="editorial-block__placeholder" aria-hidden="true" />
            )}
            <span className="editorial-block__label">
              {collection.title}
              <ArrowRightIcon className="editorial-block__arrow" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const STORY_ENTRIES = [
  {
    number: '01',
    title: "L'histoire",
    copy: 'Les origines de la marque.',
    to: '/histoire',
  },
  {
    number: '02',
    title: "L'équipe",
    copy: 'Les personnes derrière Money Therapy.',
    to: '/equipe',
  },
  {
    number: '03',
    title: 'La communauté',
    copy: 'Celles et ceux qui portent la marque.',
    to: '/communaute',
  },
];

function BrandStory() {
  return (
    <section className="brand-story" aria-labelledby="brand-story-heading">
      <h2 id="brand-story-heading" className="sr-only">
        La marque
      </h2>
      <ul className="brand-story__list">
        {STORY_ENTRIES.map((entry) => (
          <li key={entry.number}>
            <Link to={entry.to} className="brand-story__row">
              <span className="brand-story__number">{entry.number}</span>
              <span className="brand-story__text">
                <span className="brand-story__title">{entry.title}</span>
                <span className="brand-story__copy">{entry.copy}</span>
              </span>
              <ArrowRightIcon className="brand-story__arrow" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const REASSURANCE_ITEMS = [
  {Icon: TruckIcon, title: 'Livraison suivie', copy: 'Expédition rapide, suivi de commande complet.'},
  {Icon: HeadsetIcon, title: 'Service client', copy: 'Une équipe disponible pour répondre à vos questions.'},
  {Icon: LockIcon, title: 'Paiement sécurisé', copy: 'Transactions chiffrées, traitées par SumUp.'},
  {Icon: ReturnIcon, title: 'Retours & échanges', copy: 'Une procédure simple, détaillée sur notre page retours.'},
];

function Reassurance() {
  return (
    <section className="reassurance" aria-label="Réassurance">
      <ul className="reassurance__list">
        {REASSURANCE_ITEMS.map(({Icon, title, copy}) => (
          <li key={title} className="reassurance__item">
            <Icon className="reassurance__icon" />
            <h3 className="reassurance__title">{title}</h3>
            <p className="reassurance__copy">{copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const HOME_COLLECTIONS_QUERY = `#graphql
  fragment HomeCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProductMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment RecommendedProduct on Product {
    id
    title
    handle
    createdAt
    availableForSale
    priceRange {
      minVariantPrice {
        ...RecommendedProductMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...RecommendedProductMoney
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 2) {
      nodes {
        id
        availableForSale
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 10, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
