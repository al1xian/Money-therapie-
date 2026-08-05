import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {BUNDLE_ADD_ACTION} from '~/lib/offers';
import {ShinyButton} from '~/components/ShinyButton';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className = 'btn btn--full',
  bundle = false,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
  /**
   * Routes the submit through the cart's bundle action, which adds the lines
   * and applies the offer's discount code in the same request.
   */
  bundle?: boolean;
}) {
  const action = bundle ? BUNDLE_ADD_ACTION : CartForm.ACTIONS.LinesAdd;

  return (
    <CartForm route="/cart" inputs={{lines}} action={action}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <ShinyButton
            type="submit"
            className={className}
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {fetcher.state !== 'idle' ? 'adding…' : children}
          </ShinyButton>
        </>
      )}
    </CartForm>
  );
}
