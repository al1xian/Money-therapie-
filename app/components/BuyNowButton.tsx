import {useEffect} from 'react';
import {useFetcher} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

/**
 * "Buy now": adds the line to the cart, then redirects straight to the
 * Shopify checkout using the checkoutUrl returned by the cart action. Falls
 * back gracefully (does nothing beyond the add) if no URL comes back.
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
  const fetcher = useFetcher<{cart?: {checkoutUrl?: string}}>();

  useEffect(() => {
    const url = fetcher.data?.cart?.checkoutUrl;
    if (url) {
      window.location.href = url;
    }
  }, [fetcher.data]);

  const busy = fetcher.state !== 'idle';

  return (
    <fetcher.Form method="post" action="/cart">
      <input type="hidden" name="cartFormInput" value={JSON.stringify({
        action: CartForm.ACTIONS.LinesAdd,
        inputs: {lines},
      })} />
      <button type="submit" className="btn btn--full" disabled={disabled || busy}>
        {busy ? 'redirection…' : children}
      </button>
    </fetcher.Form>
  );
}
