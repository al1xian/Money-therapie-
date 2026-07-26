import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductPurchase} from '~/components/ProductPurchase';
import {ProductSpecs, type SpecRow} from '~/components/ProductSpecs';
import {ProductDescription} from '~/components/ProductDescription';
import type {SizeEntry} from '~/components/ProductSizeGuide';
import {Accordion} from '~/components/Accordion';
import {ProductItem} from '~/components/ProductItem';
import {ProductReviews} from '~/components/ProductReviews';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {productFaq} from '~/data/faq';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  return [
    {title: `reda studio | ${product?.title ?? ''}`},
    {
      name: 'description',
      content: product?.seo?.description || product?.description?.slice(0, 155) || '',
    },
    {rel: 'canonical', href: `/products/${product?.handle}`},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  const deferredData = loadDeferredData(
    args,
    criticalData.product.id,
    criticalData.product.handle,
  );
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

  return {product};
}

const MIN_RECOMMENDATIONS = 5;
const MAX_RECOMMENDATIONS = 8;

/**
 * Shopify's `productRecommendations` often returns fewer than a full row (and
 * nothing at all for a brand-new product). To keep the row filled we top it up
 * with best sellers, de-duplicated and with the current product removed — real
 * catalogue products either way, never placeholders.
 */
function loadDeferredData(
  {context}: Route.LoaderArgs,
  productId: string,
  handle: string,
) {
  const recommended = Promise.all([
    context.storefront
      .query(PRODUCT_RECOMMENDATIONS_QUERY, {variables: {productId}})
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
    context.storefront
      .query(FALLBACK_PRODUCTS_QUERY, {variables: {first: 12}})
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
  ]).then(([recos, fallback]) => {
    const seen = new Set<string>([productId]);
    const merged = [];
    for (const item of [
      ...(recos?.productRecommendations ?? []),
      ...(fallback?.products?.nodes ?? []),
    ]) {
      if (!item || seen.has(item.id) || item.handle === handle) continue;
      seen.add(item.id);
      merged.push(item);
      if (merged.length >= MAX_RECOMMENDATIONS) break;
    }
    return merged;
  });

  return {recommended};
}

/** First sentence of the product description, for the short blurb in the buy box. */
function shortenDescription(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return '';
  const firstSentence = trimmed.split(/(?<=[.!?])\s/)[0];
  const blurb = firstSentence.length > 20 ? firstSentence : trimmed;
  return blurb.length > 180 ? `${blurb.slice(0, 177).trimEnd()}…` : blurb;
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

  const {title, description, descriptionHtml, vendor, productType} = product;

  const galleryImages = product.images.nodes.length
    ? product.images.nodes
    : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  const available = Boolean(selectedVariant?.availableForSale);

  // Real size values for this product, with their live availability. Used by
  // the size guide; empty for products that have no size option at all.
  const sizeOption = productOptions.find((option) =>
    /taille|size|pointure/i.test(option.name),
  );
  const sizes: SizeEntry[] = (sizeOption?.optionValues ?? []).map((value) => ({
    name: value.name,
    available: value.available,
  }));

  // Characteristics, sourced only from Shopify fields. ProductSpecs drops any
  // row whose value is missing, so this adapts to every product in the catalogue.
  const specRows: SpecRow[] = [
    {label: 'référence', value: selectedVariant?.sku},
    {label: 'marque', value: vendor},
    {label: 'catégorie', value: productType},
    ...productOptions.map((option) => ({
      label: option.name.toLowerCase(),
      value: option.optionValues.map((value) => value.name).join(' · '),
    })),
  ];

  return (
    <div className="pdp">
      {/* Gallery + buy box only. A sticky element is clamped to its grid
          CONTAINER's box (not to its own grid area), so every section that
          comes after the gallery must stay OUTSIDE this wrapper — otherwise
          the sticky panel can travel down over them. */}
      <div className="pdp__main">
        <div className="pdp__gallery">
          <ProductGallery images={galleryImages} title={title} />
        </div>

        <aside className="pdp__buy">
          <ProductPurchase
            title={title}
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
            productOptions={productOptions}
            sizes={sizes}
            available={available}
            quantityAvailable={selectedVariant?.quantityAvailable ?? null}
            shortDescription={shortenDescription(description ?? '')}
            variantId={selectedVariant?.id}
          />
        </aside>
      </div>

      {/* Long-form content, full width, below the main product info. */}
      <div className="pdp__details">
        {descriptionHtml && (
          <section className="pdp__section">
            <ProductDescription
              html={descriptionHtml}
              intro={shortenDescription(description ?? '')}
            />
          </section>
        )}

        <section className="pdp__section">
          <h2 className="pdp__section-title">caractéristiques</h2>
          <ProductSpecs rows={specRows} />
        </section>

        <section className="pdp__section">
          <h2 className="pdp__section-title">questions fréquentes</h2>
          <div className="pdp__accordions">
            {productFaq.map((item) => (
              <Accordion key={item.question} title={item.question}>
                <p>{item.answer}</p>
              </Accordion>
            ))}
          </div>
        </section>
      </div>

      <Suspense fallback={null}>
        <Await resolve={recommended}>
          {(items) =>
            items.length ? (
              <section className="pdp__related" aria-labelledby="related-heading">
                <h2 className="pdp__section-title" id="related-heading">
                  vous aimerez aussi
                </h2>
                {/* Grid on desktop, touch slider on mobile — same markup, CSS
                    switches between them (see .related-rail). */}
                <div className="related-rail">
                  {items.map((item) => (
                    <div className="related-rail__item" key={item.id}>
                      <ProductItem product={item} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          }
        </Await>
      </Suspense>

      <div className="pdp__reviews">
        <ProductReviews productId={product.id} productTitle={title} />
      </div>

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
    quantityAvailable
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
    productType
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 12) {
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

const RECO_PRODUCT_FRAGMENT = `#graphql
  fragment RecoMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment RecoProduct on Product {
    id
    title
    handle
    availableForSale
    # Standard Shopify review metafields, written by review apps. Absent when
    # the shop has no review app — the UI then shows no rating at all.
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
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
    priceRange {
      minVariantPrice {
        ...RecoMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...RecoMoney
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
          ...RecoMoney
        }
        compareAtPrice {
          ...RecoMoney
        }
      }
    }
  }
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...RecoProduct
    }
  }
  ${RECO_PRODUCT_FRAGMENT}
` as const;

/** Tops the recommendation row up to a full set with real catalogue products. */
const FALLBACK_PRODUCTS_QUERY = `#graphql
  query PdpFallbackProducts(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...RecoProduct
      }
    }
  }
  ${RECO_PRODUCT_FRAGMENT}
` as const;
