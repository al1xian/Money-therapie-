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
import {useQuickView} from '~/components/QuickView';

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
  const {open: openQuickView} = useQuickView();
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
  // Quick view needs the fuller shape (options + variants) that only the
  // homepage's HomeProduct fragment carries — collection/related-product
  // cards elsewhere use lighter fragments and simply don't get the trigger.
  const canQuickView = 'media' in product && 'variants' in product;

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
        {canQuickView && (
          <button
            type="button"
            className="product-card__quickview"
            onClick={(event) => {
              event.preventDefault();
              openQuickView(product as HomeProductFragment);
            }}
          >
            aperçu rapide
          </button>
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
