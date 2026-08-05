import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useRef} from 'react';
import {CAP_DISCOUNT_AMOUNT, CAP_OFFER_ENABLED} from '~/lib/offers';
import {ShinyLink} from '~/components/ShinyButton';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

// Free-shipping threshold (EUR).
const FREE_SHIPPING_THRESHOLD = 150;

export function CartSummary({cart}: CartSummaryProps) {
  const subtotal = Number(cart?.cost?.subtotalAmount?.amount ?? 0);
  const currency = cart?.cost?.subtotalAmount?.currencyCode ?? 'EUR';
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="cart-summary">
      <div className="shipping-progress">
        <div className="shipping-progress__bar">
          <div className="shipping-progress__fill" style={{width: `${progress}%`}} />
        </div>
        <span className="shipping-progress__label">
          {remaining > 0
            ? `${formatMoney(remaining, currency)} away from free shipping`
            : 'free shipping unlocked ✓'}
        </span>
      </div>

      <CapOfferNote discountCodes={cart?.discountCodes} currency={currency} />

      <CartDiscounts discountCodes={cart?.discountCodes} />

      <div className="cart-summary__row">
        <span>subtotal</span>
        <span>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            '—'
          )}
        </span>
      </div>
      <p className="cart-summary__note">taxes included · shipping calculated at checkout</p>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

/**
 * States the cap offer in the cart.
 *
 * Two wordings, and the difference matters: once Shopify reports the code as
 * applicable the reduction is really in the totals, so the note says so. While
 * it is not, the note stays an invitation — it never claims a discount the
 * customer has not got.
 */
function CapOfferNote({
  discountCodes,
  currency,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  currency: string;
}) {
  if (!CAP_OFFER_ENABLED) return null;

  const active = (discountCodes ?? []).some((discount) => discount.applicable);

  return (
    <p className={`cap-offer ${active ? 'cap-offer--active' : ''}`}>
      {active
        ? `cap offer applied — ${formatMoney(CAP_DISCOUNT_AMOUNT, currency)} off, carried through to checkout`
        : `add any other piece and the cap drops by ${formatMoney(CAP_DISCOUNT_AMOUNT, currency)}`}
    </p>
  );
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;
  return (
    <ShinyLink href={checkoutUrl} target="_self" className="btn btn--full">
      proceed to checkout
    </ShinyLink>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const codes: string[] =
    discountCodes?.filter((discount) => discount.applicable)?.map(({code}) => code) || [];

  return (
    <div>
      {codes.length > 0 && (
        <UpdateDiscountForm>
          <div className="cart-summary__row">
            <code>{codes.join(', ')}</code>
            <button type="submit" className="link">
              retirer
            </button>
          </div>
        </UpdateDiscountForm>
      )}

      <UpdateDiscountForm discountCodes={codes}>
        <div className="cart-discount-form">
          <input ref={inputRef} type="text" name="discountCode" placeholder="promo code" aria-label="promo code" />
          <button type="submit">ok</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}
