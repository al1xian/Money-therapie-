import {useState} from 'react';
import type {MappedProductOptions} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';
import {BuyNowButton} from '~/components/BuyNowButton';
import {QuantitySelector} from '~/components/QuantitySelector';
import {ProductSizeGuide, type SizeEntry} from '~/components/ProductSizeGuide';
import {StarRating} from '~/components/StarRating';
import {useAside} from '~/components/Aside';
import type {ProductRating} from '~/lib/rating';

/**
 * The buy box: everything the customer needs to pick a variant and add it to
 * the cart, in the order the brief specifies — title, price, short blurb,
 * variants, size guide, quantity, add to cart, then delivery/returns.
 *
 * Long-form content (full description, characteristics, FAQ) deliberately
 * lives in full-width sections below the gallery instead of in here: keeping
 * this panel shorter than the viewport is what lets it be sticky on desktop
 * without trapping its own lower half off-screen.
 */
export function ProductPurchase({
  title,
  price,
  compareAtPrice,
  productOptions,
  sizes,
  available,
  quantityAvailable,
  shortDescription,
  variantId,
  rating,
}: {
  title: string;
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  productOptions: MappedProductOptions[];
  sizes: SizeEntry[];
  available: boolean;
  quantityAvailable: number | null;
  shortDescription: string;
  variantId?: string;
  rating?: ProductRating | null;
}) {
  const {open: openAside} = useAside();
  const [quantity, setQuantity] = useState(1);

  const priceAmount = Number(price?.amount ?? 0);
  const compareAmount = Number(compareAtPrice?.amount ?? 0);
  const discountPct =
    compareAmount > priceAmount && compareAmount > 0
      ? Math.round((1 - priceAmount / compareAmount) * 100)
      : 0;

  const stock = !available
    ? {className: 'buybox__stock--out', label: 'sold out'}
    : quantityAvailable !== null && quantityAvailable > 0 && quantityAvailable <= 5
      ? {className: 'buybox__stock--low', label: `low stock — ${quantityAvailable} left`}
      : {className: 'buybox__stock--in', label: 'in stock'};

  const lines = variantId ? [{merchandiseId: variantId, quantity}] : [];

  return (
    <div className="buybox">
      {/* Rating line above the title — only when the shop publishes real
          review metafields, never a placeholder score. */}
      {rating && (
        <div className="rating-summary">
          <StarRating rating={rating.value} size={14} />
          <span className="rating-summary__text">
            rated <strong>{rating.value.toString()}</strong> out of 5
            {typeof rating.count === 'number' && (
              <>
                {' '}from <strong>{rating.count}</strong> reviews
              </>
            )}
          </span>
        </div>
      )}

      <h1 className="buybox__title">{title}</h1>

      <div className="buybox__price">
        <ProductPrice price={price} compareAtPrice={compareAtPrice} />
        {discountPct > 0 && <span className="buybox__discount">−{discountPct}%</span>}
      </div>

      <p className="buybox__tax">
        taxes included · <a href="/legal/shipping">shipping</a>{' '}
        calculated at checkout.
      </p>

      {shortDescription && <p className="buybox__blurb">{shortDescription}</p>}

      <div className={`buybox__stock ${stock.className}`}>
        <span className="buybox__stock-dot" />
        {stock.label}
      </div>

      <ProductForm productOptions={productOptions} />

      <ProductSizeGuide sizes={sizes} />

      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        max={quantityAvailable}
        disabled={!available}
      />

      <div className="buybox__actions">
        <AddToCartButton
          className="btn btn--full btn--outline"
          disabled={!available}
          onClick={() => openAside('cart')}
          lines={lines}
        >
          {available ? 'add to cart' : 'sold out'}
        </AddToCartButton>
        <BuyNowButton disabled={!available} lines={lines}>
          buy now
        </BuyNowButton>
      </div>

      <ul className="buybox__perks">
        <li>48-hour delivery across france</li>
        <li>30-day returns &amp; exchanges</li>
        <li>secure payment</li>
      </ul>
    </div>
  );
}
