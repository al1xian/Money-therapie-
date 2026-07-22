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
import {ProductPrice} from '~/components/ProductPrice';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductForm} from '~/components/ProductForm';
import {Accordion} from '~/components/Accordion';
import {ProductItem} from '~/components/ProductItem';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `money therapy | ${data?.product.title ?? ''}`},
    {rel: 'canonical', href: `/products/${data?.product.handle}`},
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

  return {product};
}

function loadDeferredData({context}: Route.LoaderArgs, productId: string) {
  const recommended = context.storefront
    .query(PRODUCT_RECOMMENDATIONS_QUERY, {variables: {productId}})
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
  const galleryImages = product.images.nodes.length
    ? product.images.nodes
    : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  return (
    <div className="pdp">
      <div className="pdp__gallery">
        <ProductGallery images={galleryImages} />
      </div>

      <div className="pdp__info">
        <h1 className="pdp__title">{title}</h1>
        <div className="pdp__price">
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
        </div>

        {product.description ? (
          <div className="pdp__description">
            <p>{product.description}</p>
          </div>
        ) : null}

        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />

        <p className="pdp__reassurance">
          échanges gratuits · retours 30 jours · paiement sécurisé
        </p>

        <div className="pdp__accordions">
          {descriptionHtml ? (
            <Accordion title="détails" defaultOpen>
              <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
            </Accordion>
          ) : null}
          <Accordion title="livraison & retours">
            <p>
              livraison suivie, retours acceptés sous 30 jours. détails sur nos
              pages <a href="/policies/shipping-policy">livraison</a> et{' '}
              <a href="/policies/refund-policy">retours</a>.
            </p>
          </Accordion>
          <Accordion title="composition & entretien">
            <p>
              composition et conseils d&rsquo;entretien indiqués sur
              l&rsquo;étiquette du produit.
            </p>
          </Accordion>
        </div>
      </div>

      <Suspense fallback={null}>
        <Await resolve={recommended}>
          {(data) =>
            data?.productRecommendations?.length ? (
              <section className="pdp__related">
                <h2>vous aimerez aussi</h2>
                <div className="product-grid">
                  {data.productRecommendations.slice(0, 4).map((item) => (
                    <ProductItem key={item.id} product={item} />
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

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  fragment RecoMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment RecoProduct on Product {
    id
    title
    handle
    availableForSale
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
  }
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...RecoProduct
    }
  }
` as const;
