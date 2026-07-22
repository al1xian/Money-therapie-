import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useRef} from 'react';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

// Free-shipping threshold (EUR). Keep in sync with the marquee copy.
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
            ? `plus que ${formatMoney(remaining, currency)} pour la livraison offerte`
            : 'livraison offerte débloquée ✓'}
        </span>
      </div>

      <CartDiscounts discountCodes={cart?.discountCodes} />

      <div className="cart-summary__row">
        <span>sous-total</span>
        <span>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            '—'
          )}
        </span>
      </div>
      <p className="cart-summary__note">taxes incluses · livraison calculée au paiement</p>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('fr-FR', {style: 'currency', currency}).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;
  return (
    <a href={checkoutUrl} target="_self" className="btn btn--full">
      passer au paiement
    </a>
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
          <input ref={inputRef} type="text" name="discountCode" placeholder="code promo" aria-label="code promo" />
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
