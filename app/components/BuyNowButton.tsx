import {Form} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {ShinyButton} from '~/components/ShinyButton';

/**
 * "Buy now": adds the line to the cart, then goes straight to the Shopify
 * checkout.
 *
 * The redirect is done by the server, not the browser. An earlier version
 * submitted through a fetcher and then set `window.location.href` once the
 * checkout URL came back — but navigating away mid-flight aborts React
 * Router's follow-up revalidation request, and Safari surfaces that abort as
 * `TypeError: Load failed`, which lands in the root error boundary. The
 * customer saw a 500 flash on the way to payment.
 *
 * `reloadDocument` makes this a plain browser form POST: no client-side fetch
 * to abort, and the action answers with a 303 to the checkout URL, which the
 * browser simply follows.
 */
export function BuyNowButton({
  disabled,
  lines,
  children,
}: {
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  children: React.ReactNode;
}) {
  return (
    <Form method="post" action="/cart" reloadDocument>
      <input
        type="hidden"
        name="cartFormInput"
        value={JSON.stringify({
          action: CartForm.ACTIONS.LinesAdd,
          inputs: {lines},
        })}
      />
      {/* Tells the cart action to answer with a redirect to checkout. */}
      <input type="hidden" name="checkoutAfterAdd" value="true" />
      <ShinyButton type="submit" className="btn btn--full" disabled={disabled}>
        {children}
      </ShinyButton>
    </Form>
  );
}
