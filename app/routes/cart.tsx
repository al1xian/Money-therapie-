import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {BUNDLE_ADD_ACTION, CAP_DISCOUNT_CODE} from '~/lib/offers';

export const meta: Route.MetaFunction = () => {
  return [{title: `reda studio | cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    /*
     * Bundle add: the set's lines, plus the offer's discount code when the
     * offer is running. One round trip keeps the two cart mutations sequential
     * — two concurrent writes to the same cart can conflict.
     *
     * Adding the lines is the part that must not fail: it is the sale. The
     * discount is applied inside a try/catch so that a missing, expired or
     * rejected code can never take the cart mutation down with it. The
     * customer ends up with the items either way, and can always check out.
     *
     * The case stays registered even when the offer is off, so a browser
     * holding a cached page from when it was on still adds to cart instead of
     * hitting the "not defined" throw below.
     */
    case BUNDLE_ADD_ACTION: {
      // A custom action's inputs are untyped, so the lines are narrowed here.
      const bundleLines = inputs.lines as Parameters<typeof cart.addLines>[0];
      result = await cart.addLines(bundleLines);

      if (CAP_DISCOUNT_CODE) {
        try {
          const applied = (result?.cart?.discountCodes ?? [])
            .filter((discount) => discount.applicable)
            .map((discount) => discount.code);

          if (!applied.includes(CAP_DISCOUNT_CODE)) {
            const discounted = await cart.updateDiscountCodes([
              ...applied,
              CAP_DISCOUNT_CODE,
            ]);
            // Only adopt the discounted cart if it really came back.
            if (discounted?.cart) result = discounted;
          }
        } catch (error) {
          console.error('Cap discount could not be applied', error);
        }
      }
      break;
    }
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  /*
   * "Buy now" posts this flag and expects the server to send the customer
   * straight to checkout. Redirecting here rather than from the browser keeps
   * the whole thing one navigation: nothing is fetched client-side, so nothing
   * can be aborted mid-flight and surface as an error.
   *
   * If the cart came back without a checkout URL we simply fall through to the
   * cart page — a missing URL must not cost the customer their basket.
   */
  if (formData.get('checkoutAfterAdd') === 'true') {
    status = 303;
    headers.set('Location', cartResult?.checkoutUrl ?? '/cart');
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="page page--wide">
      <h1>cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
