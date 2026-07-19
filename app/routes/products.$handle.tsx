import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductForm} from '~/components/ProductForm';
import {Accordion} from '~/components/Accordion';
import {DeliveryTimeline} from '~/components/DeliveryTimeline';
import {ProductItem} from '~/components/ProductItem';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Money Therapy | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  const deferredData = loadDeferredData(args, criticalData.product.id);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

function loadDeferredData({context}: Route.LoaderArgs, productId: string) {
  const recommended = context.storefront
    .query(PRODUCT_RECOMMENDATIONS_QUERY, {
      variables: {productId},
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {recommended};
}

export default function Product() {
  const {product, recommended} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const isNew =
    product.createdAt &&
    Date.now() - new Date(product.createdAt).getTime() < 21 * 24 * 60 * 60 * 1000;
  const isOnSale =
    selectedVariant?.compareAtPrice &&
    Number(selectedVariant.compareAtPrice.amount) >
      Number(selectedVariant.price?.amount ?? 0);

  return (
    <div className="product-page">
      <div className="product-page__gallery">
        <ProductGallery
          images={product.images.nodes}
          selectedImage={selectedVariant?.image}
        />
      </div>

      <div className="product-page__info">
        <div className="product-page__badges">
          {!selectedVariant?.availableForSale && (
            <span className="badge badge--sold-out">Épuisé</span>
          )}
          {isNew && selectedVariant?.availableForSale && (
            <span className="badge badge--new">New</span>
          )}
          {isOnSale && <span className="badge badge--sale">Sale</span>}
        </div>

        <h1 className="product-page__title">{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />

        <div className="product-page__form">
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
        </div>

        <DeliveryTimeline />

        <div className="product-page__accordions">
          <Accordion title="Description" defaultOpen>
            <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          </Accordion>
          <Accordion title="Livraison & retours">
            <p>
              Les délais de livraison et les modalités de retour sont détaillés
              sur nos pages{' '}
              <a href="/policies/shipping-policy">Livraison</a> et{' '}
              <a href="/policies/refund-policy">Retours &amp; échanges</a>.
            </p>
          </Accordion>
          <Accordion title="Composition & entretien">
            <p>
              Composition et instructions d&rsquo;entretien disponibles sur
              l&rsquo;étiquette du produit.{' '}
              <a href="/contact">Contactez-nous</a> pour toute question.
            </p>
          </Accordion>
          <Accordion title="Guide des tailles">
            <p>
              Consultez notre <a href="/guide-des-tailles">guide des tailles</a>{' '}
              pour choisir la coupe adaptée.
            </p>
          </Accordion>
        </div>
      </div>

      <Suspense fallback={null}>
        <Await resolve={recommended}>
          {(data) =>
            data?.productRecommendations && data.productRecommendations.length > 0 ? (
              <section className="product-page__cross-sell" aria-labelledby="cross-sell-heading">
                <h2 id="cross-sell-heading">Compléter le look</h2>
                <div className="product-grid">
                  {data.productRecommendations.slice(0, 4).map((p) => (
                    <ProductItem key={p.id} product={p} />
                  ))}
                </div>
              </section>
            ) : null
          }
        </Await>
      </Suspense>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    createdAt
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
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
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  fragment RecommendedProductMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductRecommendation on Product {
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
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...ProductRecommendation
    }
  }
` as const;
