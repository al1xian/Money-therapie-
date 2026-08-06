import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {
  CAP_DISCOUNT_AMOUNT,
  CAP_DISCOUNT_CODE,
  CAP_OFFER_ENABLED,
} from '~/lib/offers';

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

  /*
   * The offer takes a fixed amount off the cap, never below zero — a cap
   * cheaper than the discount would otherwise show a negative price.
   */
  const capDiscount = CAP_OFFER_ENABLED
    ? Math.min(CAP_DISCOUNT_AMOUNT, giftAmount)
    : 0;
  const discountedGift = giftAmount - capDiscount;

  const bundleTotal = mainAmount + discountedGift;
  const strikeTotal = mainAmount + giftAmount;
  const showsDiscount = capDiscount > 0;

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
        {showsDiscount && (
          <span className="bundle__ribbon">
            <Money
              data={{amount: capDiscount.toFixed(2), currencyCode: currency}}
            />
            &nbsp;off the {gift.title.toLowerCase()}
          </span>
        )}

        <div className="bundle__top">
          <div>
            <p className="bundle__set-title">the complete set</p>
            <p className="bundle__set-sub">
              {showsDiscount
                ? 'add any piece and the cap drops in price'
                : 'same aesthetic, same details'}
            </p>
          </div>
          <div className="bundle__totals">
            <span className="bundle__total">
              <Money data={{amount: bundleTotal.toFixed(2), currencyCode: currency}} />
            </span>
            {showsDiscount && strikeTotal > bundleTotal && (
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
            {showsDiscount ? (
              <>
                <span className="bundle__gift-badge">
                  <Money
                    data={{
                      amount: discountedGift.toFixed(2),
                      currencyCode: currency,
                    }}
                  />
                </span>
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
          bundle={CAP_OFFER_ENABLED}
        >
          {available ? 'add set to cart' : 'sold out'}
        </AddToCartButton>

        {showsDiscount && (
          <div className="bundle__note">
            {CAP_DISCOUNT_CODE ? (
              <>
                <p>
                  we add code <strong>{CAP_DISCOUNT_CODE}</strong> to your cart
                  automatically. it stays visible there, and you can type it in
                  yourself at any time.
                </p>
              </>
            ) : (
              <p>
                the discount applies itself in your cart and at checkout — no
                code needed.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
