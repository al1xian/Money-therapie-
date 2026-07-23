import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'money therapy'},
    {name: 'description', content: 'money therapy — vêtements minimalistes.'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);
  return {
    featuredCollection: collections.nodes[0] ?? null,
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
  const featured = data.featuredCollection;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          {/* remplacer par la vraie image/vidéo de campagne (hero) */}
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

      <RecommendedProducts products={data.recommendedProducts} />

      <Reveal as="section">
        <Newsletter />
      </Reveal>
    </div>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="product-row" aria-labelledby="featured-heading">
      <h2 id="featured-heading" className="sr-only">
        produits en avant
      </h2>
      <Suspense fallback={<div className="product-row__track" aria-hidden="true" />}>
        <Await resolve={products}>
          {(response) =>
            response ? (
              <div className="product-row__track">
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

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
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
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment RecommendedProduct on Product {
    id
    title
    handle
    availableForSale
    priceRange {
      minVariantPrice {
        ...RecommendedMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...RecommendedMoney
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
          ...RecommendedMoney
        }
        compareAtPrice {
          ...RecommendedMoney
        }
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
