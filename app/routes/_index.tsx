import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {AllProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {CollectionsSlider} from '~/components/CollectionsSlider';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'money therapy'},
    {name: 'description', content: 'money therapy — vêtements minimalistes.'},
  ];
};

/** Preload the hero image (LCP element on the homepage). */
export function links() {
  return [{rel: 'preload', as: 'image', href: '/images/P1973928-2.webp'}];
}

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
    collections: collections.nodes,
    featuredCollection: collections.nodes[0] ?? null,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  // "first: 100" shows the full catalog on the homepage — the point isn't a
  // paginated slice, it's every product, dynamically from Shopify.
  const allProducts = context.storefront
    .query(ALL_PRODUCTS_QUERY, {variables: {first: 100}})
    .catch((error: Error) => {
      console.error(error);
      return null;
    });
  return {allProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const featured = data.featuredCollection;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__media">
          {/* Mobile: object-contain so both people stay fully in frame on a
              tall, narrow viewport instead of being cropped by a full-bleed
              cover of a wide photo — no distortion either way, only cover vs
              contain. Desktop: full-bleed object-cover. */}
          <img
            src="/images/P1973928-2.webp"
            alt="Deux personnes en tenue money therapy, ambiance urbaine"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="hero__img hero__img--mobile"
          />
          <img
            src="/images/P1973928-2.webp"
            alt="Deux personnes en tenue money therapy, ambiance urbaine"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="hero__img hero__img--desktop"
          />
        </div>
        <div className="hero__caption">
          <span className="hero__title">nouvelle collection</span>
          <Link
            to={featured ? `/collections/${featured.handle}` : '/collections/all'}
            className="hero__cta"
          >
            découvrir
          </Link>
        </div>
      </section>

      <CollectionsSlider collections={data.collections} />

      <AllProducts products={data.allProducts} />

      <Reveal as="section">
        <Newsletter />
      </Reveal>
    </div>
  );
}

function AllProducts({
  products,
}: {
  products: Promise<AllProductsQuery | null>;
}) {
  return (
    <section aria-labelledby="catalogue-heading">
      <Reveal as="section">
        <h2 id="catalogue-heading" className="section-title">
          tous nos produits
        </h2>
      </Reveal>
      <Suspense fallback={<div className="product-grid" aria-hidden="true" />}>
        <Await resolve={products}>
          {(response) =>
            response ? (
              <div className="product-grid">
                {response.products.nodes.map((product, index) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    loading={index < 4 ? 'eager' : undefined}
                  />
                ))}
              </div>
            ) : null
          }
        </Await>
      </Suspense>
      <div className="view-all">
        <Link to="/collections/all">voir tout</Link>
      </div>
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
    collections(first: 10, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
` as const;

const ALL_PRODUCTS_QUERY = `#graphql
  fragment HomeMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment HomeProduct on Product {
    id
    title
    handle
    availableForSale
    priceRange {
      minVariantPrice {
        ...HomeMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...HomeMoney
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
    media(first: 3) {
      nodes {
        mediaContentType
        ... on Video {
          id
          previewImage {
            id
            url
            altText
            width
            height
          }
          sources {
            url
            mimeType
            format
          }
        }
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
    variants(first: 20) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          ...HomeMoney
        }
        compareAtPrice {
          ...HomeMoney
        }
      }
    }
  }
  query AllProducts ($country: CountryCode, $language: LanguageCode, $first: Int)
    @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeProduct
      }
    }
  }
` as const;
