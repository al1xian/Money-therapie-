/**
 * Discount code backing the "buy the piece, get the cap free" offer.
 *
 * A storefront cannot change a price: what the customer pays is decided by
 * Shopify at cart and checkout. So the offer is driven by a real Shopify
 * discount, and the storefront's job is to apply it to the cart automatically
 * whenever the set is added — see the `BundleAdd` case in app/routes/cart.tsx.
 *
 * The matching discount must exist in Shopify Admin → Discounts, as a
 * "Buy X get Y" code discount using exactly this code. The procedure is
 * written up in docs/free-cap-offer.md.
 *
 * Set this to an empty string to switch the offer off: the cap then shows at
 * its real price everywhere and no code is applied.
 */
export const FREE_CAP_DISCOUNT_CODE = 'FREECAP';

/** True while the free-cap offer is active. */
export const FREE_CAP_ENABLED = FREE_CAP_DISCOUNT_CODE.length > 0;

/** Custom cart action: add the set's lines, then apply the offer's code. */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;
