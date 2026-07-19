import {Link} from 'react-router';
import {Image, Money, CartForm} from '@shopify/hydrogen';
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

const NEW_WINDOW_DAYS = 21;

export function ProductItem({
  product,
  loading,
}: {
  product: GridProduct;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const secondImage = product.images?.nodes?.find((img) => img.id !== image?.id);

  const price = product.priceRange.minVariantPrice;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice;
  const isOnSale =
    compareAtPrice && Number(compareAtPrice.amount) > Number(price.amount);
  const isSoldOut = product.availableForSale === false;
  const isNew =
    'createdAt' in product &&
    product.createdAt &&
    Date.now() - new Date(product.createdAt).getTime() <
      NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const singleVariant =
    'variants' in product &&
    product.variants?.nodes?.length === 1 &&
    product.variants.nodes[0].availableForSale
      ? product.variants.nodes[0]
      : null;

  return (
    <div className="product-card">
      <Link className="product-card__media" prefetch="intent" to={variantUrl}>
        <div className="product-card__badges">
          {isSoldOut ? (
            <span className="badge badge--sold-out">Épuisé</span>
          ) : (
            <>
              {isNew && <span className="badge badge--new">New</span>}
              {isOnSale && <span className="badge badge--sale">Sale</span>}
            </>
          )}
        </div>
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="4/5"
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 20vw, (min-width: 45em) 33vw, 50vw"
            className="product-card__image product-card__image--primary"
          />
        )}
        {secondImage && (
          <Image
            alt={secondImage.altText || product.title}
            aspectRatio="4/5"
            data={secondImage}
            loading="lazy"
            sizes="(min-width: 64em) 20vw, (min-width: 45em) 33vw, 50vw"
            className="product-card__image product-card__image--secondary"
          />
        )}
        <span className="product-card__quick-action">
          {singleVariant ? 'Ajout rapide' : "Choisir les options"}
        </span>
      </Link>
      <Link className="product-card__info" prefetch="intent" to={variantUrl}>
        <h4 className="product-card__title">{product.title}</h4>
        <div className="product-card__price">
          {isOnSale && compareAtPrice && (
            <s className="product-card__compare-price">
              <Money data={compareAtPrice} />
            </s>
          )}
          <Money data={price} />
        </div>
      </Link>
      {singleVariant && (
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={{
            lines: [{merchandiseId: singleVariant.id, quantity: 1}],
          }}
        >
          {(fetcher) => (
            <button
              type="submit"
              className="product-card__quick-add"
              disabled={fetcher.state !== 'idle'}
            >
              {fetcher.state !== 'idle' ? 'Ajout…' : 'Ajout rapide'}
            </button>
          )}
        </CartForm>
      )}
    </div>
  );
}
