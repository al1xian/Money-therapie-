import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useQuickView, type QuickViewProduct} from '~/components/QuickView';

type GridProduct =
  | CollectionItemFragment
  | ProductItemFragment
  | RecommendedProductFragment;

export function ProductItem({
  product,
  loading,
}: {
  product: GridProduct;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const {open} = useQuickView();
  const image = product.featuredImage;

  const images = 'images' in product ? product.images?.nodes ?? [] : [];
  const altImage = images.find((img) => img.id !== image?.id);
  const price = product.priceRange.minVariantPrice;
  const compareAt =
    'compareAtPriceRange' in product
      ? product.compareAtPriceRange?.minVariantPrice
      : undefined;
  const onSale = compareAt && Number(compareAt.amount) > Number(price.amount);

  // Quick view only when the fragment carries variants (grid/home queries do).
  const canQuickView = 'variants' in product && !!product.variants?.nodes?.length;

  return (
    <div className="product-card">
      <Link className="product-card__media" prefetch="intent" to={variantUrl}>
        {onSale && <span className="badge-sale">sale</span>}
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw"
            className="product-card__img product-card__img--main"
          />
        )}
        {altImage && (
          <Image
            alt={altImage.altText || product.title}
            aspectRatio="1/1"
            data={altImage}
            loading="lazy"
            sizes="(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw"
            className="product-card__img product-card__img--alt"
          />
        )}
        {canQuickView && (
          <button
            type="button"
            className="product-card__quickview"
            onClick={(e) => {
              e.preventDefault();
              open(product as unknown as QuickViewProduct);
            }}
          >
            aperçu rapide
          </button>
        )}
      </Link>
      <Link className="product-card__info" prefetch="intent" to={variantUrl}>
        <h3 className="product-card__title">{product.title}</h3>
        <div className="product-card__price">
          <Money data={price} />
          {onSale && compareAt && (
            <s>
              <Money data={compareAt} />
            </s>
          )}
        </div>
      </Link>
    </div>
  );
}
