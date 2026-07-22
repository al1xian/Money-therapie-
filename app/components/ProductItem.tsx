import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

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
  const image = product.featuredImage;

  // Optional fields (present when the query fragment includes them).
  const images = 'images' in product ? product.images?.nodes ?? [] : [];
  const altImage = images.find((img) => img.id !== image?.id);
  const price = product.priceRange.minVariantPrice;
  const compareAt =
    'compareAtPriceRange' in product
      ? product.compareAtPriceRange?.minVariantPrice
      : undefined;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount);

  return (
    <Link className="product-card" prefetch="intent" to={variantUrl}>
      <div className="product-card__media">
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
      </div>
      <div className="product-card__info">
        <h3 className="product-card__title">{product.title}</h3>
        <div className="product-card__price">
          <Money data={price} />
          {onSale && compareAt && (
            <s>
              <Money data={compareAt} />
            </s>
          )}
        </div>
      </div>
    </Link>
  );
}
