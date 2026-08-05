import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {AllProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {CollectionsSlider} from '~/components/CollectionsSlider';
import {AnimatedHero} from '~/components/AnimatedHero';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';
import {HomeReviews} from '~/components/HomeReviews';
import {WornVideos} from '~/components/WornVideos';
import {HelpFaq} from '~/components/HelpFaq';
import {withoutHomeHiddenCollections} from '~/lib/collections';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio'},
    {name: 'description', content: 'reda studio — minimalist essentials.'},
  ];
};

/**
 * Preload the hero image (LCP element on the homepage). Mobile and desktop
 * use different crops, so each preload is scoped with `media` to avoid
 * downloading both.
 */
export function links() {
  return [
    {
      rel: 'preload',
      as: 'image',
      href: '/images/hero2-mobile.webp',
      media: '(max-width: 47.99em)',
    },
    {
      rel: 'preload',
      as: 'image',
      href: '/images/hero-desktop1.webp',
      media: '(min-width: 48em)',
    },
  ];
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
  // « summer drop » et « all in drop » restent visibles dans le header, sur
  // /collections et dans la vitrine des pages produit, mais pas sur l'accueil.
  const visible = withoutHomeHiddenCollections(collections.nodes);
  return {
    collections: visible,
    featuredCollection: visible[0] ?? null,
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
      <AnimatedHero
        imageMobileSrc="/images/hero2-mobile.webp"
        imageDesktopSrc="/images/hero-desktop1.webp"
        imageAlt="Two men in reda studio checked overshirts and black shorts, against a brick facade"
        eyebrow="new collection"
        title="reda studio"
        description="designed for people with ambition."
        ctaButton={{
          text: 'shop now',
          href: featured ? `/collections/${featured.handle}` : '/collections/all',
        }}
        secondaryCta={{text: 'our story', href: '/about'}}
      />

      <CollectionsSlider collections={data.collections} />

      <AllProducts products={data.allProducts} />

      <HomeReviews />

      <HelpFaq />

      <WornVideos />

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
          all products
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
        <Link to="/collections/all">view all</Link>
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
