import {useState} from 'react';
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
import {useT} from '~/lib/i18n';

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
 * The offer applies to *any* second item — it is a Shopify discount on the
 * basket, not on a particular pair. So the box no longer names one product:
 * it lists what is eligible and lets the customer pick, which is what the
 * offer has always actually been. Nothing here is specific to a cap, or to any
 * other product; change the catalogue and the choices change with it.
 *
 * The reduction is shown on the cheaper of the two, because that is where
 * Shopify puts it. See `pairSaving`.
 */
export function BundleOffer({
  productTitle,
  productImage,
  productPrice,
  productVariantId,
  choices,
  available,
}: {
  productTitle: string;
  productImage?: PairedProduct['featuredImage'];
  productPrice?: MoneyV2;
  productVariantId?: string;
  choices: PairedProduct[];
  available: boolean;
}) {
  const {open: openAside} = useAside();
  const t = useT();

  // Which second piece is currently selected. Starts on the first eligible
  // one so the box always shows a real, priced pair rather than an empty slot.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const eligible = choices.filter((choice) => choice.variantId && choice.price);
  const selected =
    eligible.find((choice) => choice.id === selectedId) ?? eligible[0];

  if (!selected?.variantId || !productVariantId || !productPrice || !selected.price) {
    return null;
  }

  const mainAmount = Number(productPrice.amount);
  const secondAmount = Number(selected.price.amount);
  const currency = productPrice.currencyCode;

  const saving = pairSaving(mainAmount, secondAmount);
  const showsDiscount = saving > 0;
  // Which row carries the reduction — the cheaper one.
  const discountedIsSecond = secondAmount <= mainAmount;

  const fullTotal = mainAmount + secondAmount;
  const pairTotal = fullTotal - saving;

  const lines = [
    {merchandiseId: productVariantId, quantity: 1},
    {merchandiseId: selected.variantId, quantity: 1},
  ];

  const money = (amount: number) => ({
    amount: amount.toFixed(2),
    currencyCode: currency,
  });

  return (
    <section className="bundle" aria-labelledby="bundle-heading">
      <h2 className="bundle__heading" id="bundle-heading">
        {t('offer.heading')}
      </h2>

      <div className="bundle__box">
        {showsDiscount && (
          <span className="bundle__ribbon">
            {t('offer.ribbon', {percent: SECOND_ITEM_DISCOUNT_PERCENT})}
          </span>
        )}

        <div className="bundle__top">
          <div>
            <p className="bundle__set-title">{t('offer.takeTwo')}</p>
            <p className="bundle__set-sub">
              {showsDiscount
                ? t('offer.sub', {percent: SECOND_ITEM_DISCOUNT_PERCENT})
                : t('offer.subOff')}
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
          image={selected.featuredImage}
          title={selected.title}
          amount={secondAmount}
          discounted={showsDiscount && discountedIsSecond}
          saving={saving}
          money={money}
        />

        {/*
          The choice itself. A radio group rather than a select: on a phone the
          thumbnails are what tell someone what they are choosing, and a native
          select would hide them behind a tap.
        */}
        {eligible.length > 1 && (
          <fieldset className="bundle__choices">
            <legend className="bundle__choices-label">{t('offer.pick')}</legend>
            <div className="bundle__choices-grid">
              {eligible.map((choice) => (
                <label
                  key={choice.id}
                  className="bundle__choice"
                  data-selected={choice.id === selected.id ? 'true' : undefined}
                >
                  <input
                    type="radio"
                    name="pair-choice"
                    value={choice.id}
                    checked={choice.id === selected.id}
                    onChange={() => setSelectedId(choice.id)}
                  />
                  <span className="bundle__choice-thumb">
                    {choice.featuredImage && (
                      <Image
                        data={choice.featuredImage}
                        alt={choice.featuredImage.altText || choice.title}
                        aspectRatio="1/1"
                        sizes="64px"
                        loading="lazy"
                      />
                    )}
                  </span>
                  <span className="bundle__choice-name">
                    {choice.title.toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <AddToCartButton
          className="btn btn--full bundle__cta"
          disabled={!available}
          onClick={() => openAside('cart')}
          lines={lines}
          bundle={OFFER_ENABLED}
        >
          {available ? t('offer.addBoth') : t('product.soldOut')}
        </AddToCartButton>

        {showsDiscount && (
          <div className="bundle__note">
            <p>
              {OFFER_DISCOUNT_CODE
                ? t('offer.noteCode', {code: OFFER_DISCOUNT_CODE})
                : t('offer.noteAuto')}
            </p>
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
