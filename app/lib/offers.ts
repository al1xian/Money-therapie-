/**
 * Cap offer — €10 off the cap when the customer buys any other product.
 *
 * A storefront cannot change a price: what the customer pays is decided by
 * Shopify at cart and checkout. So the offer is driven by a real Shopify
 * discount, and the storefront's job is to apply it to the cart automatically
 * when the set is added — see the `CustomBundleAdd` case in app/routes/cart.tsx.
 *
 * The matching discount must exist in Shopify Admin → Discounts, as a
 * "Buy X get Y" code discount using exactly this code, granting €10 off the
 * cap. Until it does, the page announces a reduction the cart will not apply.
 * The procedure is in docs/cap-offer.md.
 *
 * Set the code to an empty string to switch the offer off: the cap then shows
 * at its real price everywhere and no code is applied.
 */
export const CAP_DISCOUNT_CODE: string = 'CAP10';

/** Amount taken off the cap, in the store's currency. */
export const CAP_DISCOUNT_AMOUNT = 10;

/** True while the cap offer is active. */
export const CAP_OFFER_ENABLED: boolean = CAP_DISCOUNT_CODE.length > 0;

/**
 * Custom cart action: add the set's lines, then apply the offer's code.
 *
 * Kept registered in the cart route even when the offer is off — a browser
 * holding a cached page from when it was on would otherwise submit an action
 * the route no longer knows, and fall through to the "not defined" throw.
 */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;
