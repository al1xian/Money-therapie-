import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecoProductFragment,
  HomeProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useNearViewport} from '~/lib/useNearViewport';
import {getProductVideo} from '~/lib/media';
import {parseRating} from '~/lib/rating';
import {StarRating} from '~/components/StarRating';

type GridProduct =
  | CollectionItemFragment
  | ProductItemFragment
  | RecoProductFragment
  | HomeProductFragment;

export function ProductItem({
  product,
  loading,
}: {
  product: GridProduct;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const {ref, near} = useNearViewport<HTMLDivElement>();
  const image = product.featuredImage;

  const images = 'images' in product ? product.images?.nodes ?? [] : [];
  const altImage = images.find((img) => img.id !== image?.id);
  const video = 'media' in product ? getProductVideo(product) : null;
  const price = product.priceRange.minVariantPrice;
  const compareAt =
    'compareAtPriceRange' in product
      ? product.compareAtPriceRange?.minVariantPrice
      : undefined;
  const onSale = compareAt && Number(compareAt.amount) > Number(price.amount);

  // Only shown when the shop actually publishes review metafields — never a
  // placeholder or invented score.
  const rating =
    'rating' in product
      ? parseRating(product.rating, 'ratingCount' in product ? product.ratingCount : null)
      : null;

  return (
    <Link className="product-card" prefetch="intent" to={variantUrl}>
      <div className="product-card__media" ref={ref}>
        {onSale && <span className="badge-sale">sale</span>}
        {video && near ? (
          <video
            className="product-card__img product-card__img--main"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={video.previewImage?.url ?? image?.url}
          >
            {video.sources.map((source) => (
              <source key={source.url} src={source.url} type={source.mimeType} />
            ))}
          </video>
        ) : (
          image && (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw"
              className="product-card__img product-card__img--main"
            />
          )
        )}
        {altImage && !video && (
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
        {rating && (
          <StarRating
            rating={rating.value}
            count={rating.count}
            className="product-card__rating"
          />
        )}
      </div>
    </Link>
  );
}
