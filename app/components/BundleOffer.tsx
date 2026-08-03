import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

/**
 * Set to true ONLY once the matching "Buy X get Y" automatic discount is live
 * in Shopify (Discounts → Create → Buy X get Y).
 *
 * The storefront cannot make a product free on its own: the price the customer
 * pays is decided by Shopify at cart and checkout. While this is false the cap
 * is presented — truthfully — as a paid add-on at its real price. Flipping it
 * to true switches the presentation to "offert"; doing that *before* the
 * discount exists would promise a price the cart will not honour.
 */
const FREE_GIFT_ENABLED = false;

export type GiftProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  variantId?: string;
  price?: MoneyV2;
};

export function BundleOffer({
  productTitle,
  productImage,
  productPrice,
  productVariantId,
  gift,
  available,
}: {
  productTitle: string;
  productImage?: GiftProduct['featuredImage'];
  productPrice?: MoneyV2;
  productVariantId?: string;
  gift: GiftProduct | null;
  available: boolean;
}) {
  const {open: openAside} = useAside();

  if (!gift?.variantId || !productVariantId || !productPrice || !gift.price) {
    return null;
  }

  const mainAmount = Number(productPrice.amount);
  const giftAmount = Number(gift.price.amount);
  const currency = productPrice.currencyCode;

  // With the gift free the set costs the product alone; otherwise it's the
  // honest sum of both items.
  const bundleTotal = FREE_GIFT_ENABLED ? mainAmount : mainAmount + giftAmount;
  const strikeTotal = mainAmount + giftAmount;

  const lines = [
    {merchandiseId: productVariantId, quantity: 1},
    {merchandiseId: gift.variantId, quantity: 1},
  ];

  return (
    <section className="bundle" aria-labelledby="bundle-heading">
      <h2 className="bundle__heading" id="bundle-heading">
        limited offer
      </h2>

      <div className="bundle__box">
        {FREE_GIFT_ENABLED && (
          <span className="bundle__ribbon">{gift.title} free</span>
        )}

        <div className="bundle__top">
          <div>
            <p className="bundle__set-title">the complete set</p>
            <p className="bundle__set-sub">same aesthetic, same details</p>
          </div>
          <div className="bundle__totals">
            <span className="bundle__total">
              <Money data={{amount: bundleTotal.toFixed(2), currencyCode: currency}} />
            </span>
            {FREE_GIFT_ENABLED && strikeTotal > bundleTotal && (
              <s className="bundle__strike">
                <Money data={{amount: strikeTotal.toFixed(2), currencyCode: currency}} />
              </s>
            )}
          </div>
        </div>

        <div className="bundle__row">
          <span className="bundle__thumb">
            {productImage && (
              <Image data={productImage} alt={productTitle} sizes="56px" loading="lazy" />
            )}
          </span>
          <span className="bundle__item-name">{productTitle}</span>
          <span className="bundle__item-price">
            <Money data={productPrice} />
          </span>
        </div>

        <div className="bundle__plus" aria-hidden="true">
          <span>+</span>
        </div>

        <div className="bundle__row">
          <span className="bundle__thumb">
            {gift.featuredImage && (
              <Image
                data={gift.featuredImage}
                alt={gift.featuredImage.altText || gift.title}
                sizes="56px"
                loading="lazy"
              />
            )}
          </span>
          <span className="bundle__item-name">{gift.title}</span>
          <span className="bundle__item-price">
            {FREE_GIFT_ENABLED ? (
              <>
                <span className="bundle__gift-badge">offert</span>
                <s className="bundle__strike">
                  <Money data={gift.price} />
                </s>
              </>
            ) : (
              <Money data={gift.price} />
            )}
          </span>
        </div>

        <AddToCartButton
          className="btn btn--full bundle__cta"
          disabled={!available}
          onClick={() => openAside('cart')}
          lines={lines}
        >
          {available ? 'add set to cart' : 'sold out'}
        </AddToCartButton>
      </div>
    </section>
  );
}
