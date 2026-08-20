import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {
  OFFER_DISCOUNT_CODE,
  OFFER_ENABLED,
  SECOND_ITEM_DISCOUNT_PERCENT,
  pairSaving,
} from '~/lib/offers';

export type PairedProduct = {
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

/**
 * "Second piece at −30%", shown on the product page.
 *
 * The offer itself applies to *any* second item — it is a Shopify discount on
 * the basket, not on a particular pair. This box is only the shortest route to
 * it: one tap adds this piece plus a suggested second one, already priced.
 *
 * The reduction is shown on the cheaper of the two, because that is where
 * Shopify puts it. See `pairSaving`.
 */
export function BundleOffer({
  productTitle,
  productImage,
  productPrice,
  productVariantId,
  pairedWith,
  available,
}: {
  productTitle: string;
  productImage?: PairedProduct['featuredImage'];
  productPrice?: MoneyV2;
  productVariantId?: string;
  pairedWith: PairedProduct | null;
  available: boolean;
}) {
  const {open: openAside} = useAside();

  if (
    !pairedWith?.variantId ||
    !productVariantId ||
    !productPrice ||
    !pairedWith.price
  ) {
    return null;
  }

  const mainAmount = Number(productPrice.amount);
  const secondAmount = Number(pairedWith.price.amount);
  const currency = productPrice.currencyCode;

  const saving = pairSaving(mainAmount, secondAmount);
  const showsDiscount = saving > 0;
  // Which row carries the reduction — the cheaper one.
  const discountedIsSecond = secondAmount <= mainAmount;

  const fullTotal = mainAmount + secondAmount;
  const pairTotal = fullTotal - saving;

  const lines = [
    {merchandiseId: productVariantId, quantity: 1},
    {merchandiseId: pairedWith.variantId, quantity: 1},
  ];

  const money = (amount: number) => ({
    amount: amount.toFixed(2),
    currencyCode: currency,
  });

  return (
    <section className="bundle" aria-labelledby="bundle-heading">
      <h2 className="bundle__heading" id="bundle-heading">
        limited offer
      </h2>

      <div className="bundle__box">
        {showsDiscount && (
          <span className="bundle__ribbon">
            &minus;{SECOND_ITEM_DISCOUNT_PERCENT}%&nbsp;on your second piece
          </span>
        )}

        <div className="bundle__top">
          <div>
            <p className="bundle__set-title">take two</p>
            <p className="bundle__set-sub">
              {showsDiscount
                ? `add a second piece — any piece — and ${SECOND_ITEM_DISCOUNT_PERCENT}% comes off it`
                : 'same aesthetic, same details'}
            </p>
          </div>
          <div className="bundle__totals">
            <span className="bundle__total">
              <Money data={money(pairTotal)} />
            </span>
            {showsDiscount && fullTotal > pairTotal && (
              <s className="bundle__strike">
                <Money data={money(fullTotal)} />
              </s>
            )}
          </div>
        </div>

        <PairRow
          image={productImage}
          title={productTitle}
          amount={mainAmount}
          discounted={showsDiscount && !discountedIsSecond}
          saving={saving}
          money={money}
        />

        <div className="bundle__plus" aria-hidden="true">
          <span>+</span>
        </div>

        <PairRow
          image={pairedWith.featuredImage}
          title={pairedWith.title}
          amount={secondAmount}
          discounted={showsDiscount && discountedIsSecond}
          saving={saving}
          money={money}
        />

        <AddToCartButton
          className="btn btn--full bundle__cta"
          disabled={!available}
          onClick={() => openAside('cart')}
          lines={lines}
          bundle={OFFER_ENABLED}
        >
          {available ? 'add both to cart' : 'sold out'}
        </AddToCartButton>

        {showsDiscount && (
          <div className="bundle__note">
            {OFFER_DISCOUNT_CODE ? (
              <p>
                works with any second piece, not just this pair. we add code{' '}
                <strong>{OFFER_DISCOUNT_CODE}</strong> to your cart for you —
                it stays visible there, and you can type it in yourself at any
                time.
              </p>
            ) : (
              <p>
                works with any second piece, not just this pair. no code needed
                — the reduction applies itself in your cart and at checkout.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function PairRow({
  image,
  title,
  amount,
  discounted,
  saving,
  money,
}: {
  image?: PairedProduct['featuredImage'];
  title: string;
  amount: number;
  discounted: boolean;
  saving: number;
  money: (amount: number) => MoneyV2;
}) {
  return (
    <div className="bundle__row">
      <span className="bundle__thumb">
        {image && (
          <Image
            data={image}
            alt={image.altText || title}
            sizes="56px"
            loading="lazy"
          />
        )}
      </span>
      <span className="bundle__item-name">{title}</span>
      <span className="bundle__item-price">
        {discounted ? (
          <>
            <span className="bundle__gift-badge">
              <Money data={money(amount - saving)} />
            </span>
            <s className="bundle__strike">
              <Money data={money(amount)} />
            </s>
          </>
        ) : (
          <Money data={money(amount)} />
        )}
      </span>
    </div>
  );
}
