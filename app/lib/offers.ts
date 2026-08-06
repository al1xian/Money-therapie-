/**
 * Cap offer — €10 off the cap when the customer buys any other product.
 *
 * A storefront cannot change a price: what the customer pays is decided by
 * Shopify at cart and checkout. So the offer is driven by a real Shopify
 * discount, and this file only says which one and how to talk about it. The
 * procedure to create it is in docs/cap-offer.md.
 *
 * The offer runs on a **discount code**, which the customer can see, copy and
 * type into the cart. The storefront also attaches it to the cart on its own
 * after every change (see app/routes/cart.tsx), so it works whether they type
 * it or not — the code is a promise they can check, not a hoop to jump
 * through.
 *
 * Until a discount with this exact code exists in Shopify Admin → Discounts,
 * the product page announces a reduction the cart will not apply.
 */

/**
 * The code, exactly as it must be spelled in Shopify — uppercase, no spaces.
 * Set it to an empty string to go back to an automatic discount, which the
 * storefront then leaves entirely to Shopify.
 */
export const CAP_DISCOUNT_CODE: string = 'CAP55';

/**
 * Amount taken off the cap, in the store's currency.
 *
 * This figure only drives what the product page *displays*. The reduction the
 * customer actually gets is the one configured in Shopify. If the two
 * disagree, they see one price and pay another — change both together.
 */
export const CAP_DISCOUNT_AMOUNT = 10;

/** Set to false to switch the offer off across the storefront. */
export const CAP_OFFER_ENABLED = true;

/**
 * Custom cart action: adds the set's two lines in one request.
 *
 * Kept registered in the cart route even when the offer is off — a browser
 * holding a cached page from when it was on would otherwise submit an action
 * the route no longer knows, and fall through to the "not defined" throw.
 */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;
