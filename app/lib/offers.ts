/**
 * Cap offer — €10 off the cap when the customer buys any other product.
 *
 * A storefront cannot change a price: what the customer pays is decided by
 * Shopify at cart and checkout. So the offer is driven by a real Shopify
 * discount — and it is an **automatic** one, not a discount code.
 *
 * That distinction is the whole design. An automatic discount is evaluated by
 * Shopify on the cart itself: as soon as the basket satisfies the conditions,
 * the reduction appears in the totals and follows the customer into checkout.
 * Nobody types anything, the storefront applies nothing, and there is no code
 * to leak, mistype or share. The procedure to create it is in docs/cap-offer.md.
 *
 * Until that discount exists in Shopify Admin → Discounts, the product page
 * announces a reduction the cart will not apply.
 */

/** Amount taken off the cap, in the store's currency. */
export const CAP_DISCOUNT_AMOUNT = 10;

/** Set to false to switch the offer off across the storefront. */
export const CAP_OFFER_ENABLED = true;

/**
 * Optional discount **code** for the same offer.
 *
 * Empty, and meant to stay empty: the offer runs on an automatic discount. It
 * exists as an escape hatch — if the offer ever has to be a code again (to
 * restrict it to a campaign link, say), putting the code here makes the cart
 * route attach it to every basket, exactly as before.
 */
export const CAP_DISCOUNT_CODE: string = '';

/**
 * Custom cart action: adds the set's two lines in one request.
 *
 * Kept registered in the cart route even when the offer is off — a browser
 * holding a cached page from when it was on would otherwise submit an action
 * the route no longer knows, and fall through to the "not defined" throw.
 */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;
