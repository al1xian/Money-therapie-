import {redirect, useLoaderData, useSearchParams, useNavigation} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {CollectionSortFilter} from '~/components/CollectionSortFilter';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Money Therapy | ${data?.collection.title ?? ''}`}];
};

const SORT_OPTIONS = {
  newest: {sortKey: 'CREATED' as const, reverse: true},
  'price-asc': {sortKey: 'PRICE' as const, reverse: false},
  'price-desc': {sortKey: 'PRICE' as const, reverse: true},
  'title-asc': {sortKey: 'TITLE' as const, reverse: false},
};
export type SortKeyOption = keyof typeof SORT_OPTIONS;

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const sortParam = (url.searchParams.get('sort') as SortKeyOption) || 'newest';
  const {sortKey, reverse} = SORT_OPTIONS[sortParam] ?? SORT_OPTIONS.newest;
  const inStockOnly = url.searchParams.get('available') === '1';

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        sortKey,
        reverse,
        filters: inStockOnly ? [{available: true}] : [],
        ...paginationVariables,
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    appliedSort: sortParam,
    appliedAvailable: inStockOnly,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {collection, appliedSort, appliedAvailable} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const isChangingFilters =
    navigation.state === 'loading' &&
    navigation.location?.pathname === `/collections/${collection.handle}`;

  return (
    <div className="collection-page">
      <div className="collection-page__head">
        <h1>{collection.title}</h1>
        {collection.description && (
          <p className="collection-page__description">{collection.description}</p>
        )}
        <p className="collection-page__count">
          {collection.products.nodes.length} produit
          {collection.products.nodes.length > 1 ? 's' : ''}
        </p>
      </div>

      <CollectionSortFilter
        sort={appliedSort}
        available={appliedAvailable}
        searchParams={searchParams}
      />

      <div className={`product-grid ${isChangingFilters ? 'product-grid--loading' : ''}`}>
        <PaginatedResourceSection<ProductItemFragment>
          connection={collection.products}
          resourcesClassName="product-grid__inner"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      </div>

      {collection.products.nodes.length === 0 && (
        <div className="collection-page__empty">
          <p>Aucun produit ne correspond à cette sélection pour le moment.</p>
        </div>
      )}

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    createdAt
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 2) {
      nodes {
        id
        availableForSale
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: $sortKey,
        reverse: $reverse,
        filters: $filters
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
