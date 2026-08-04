/**
 * Discount code backing the "buy the piece, get the cap free" offer.
 *
 * A storefront cannot change a price: what the customer pays is decided by
 * Shopify at cart and checkout. So the offer is driven by a real Shopify
 * discount, and the storefront's job is to apply it to the cart automatically
 * whenever the set is added — see the `CustomBundleAdd` case in
 * app/routes/cart.tsx.
 *
 * IT IS OFF BY DEFAULT, ON PURPOSE. Turning it on before the matching discount
 * exists in Shopify has two costs: the page promises a free cap the cart will
 * charge for, and every "add set to cart" fires a second cart mutation that can
 * only fail — on the one path where a failure costs a sale.
 *
 * To switch it on, once and only once the discount is live in Shopify Admin →
 * Discounts as a "Buy X get Y" code discount using exactly this code:
 *
 *     export const FREE_CAP_DISCOUNT_CODE = 'FREECAP';
 *
 * The full procedure is in docs/free-cap-offer.md.
 */
export const FREE_CAP_DISCOUNT_CODE: string = '';

/** True while the free-cap offer is active. */
export const FREE_CAP_ENABLED: boolean = FREE_CAP_DISCOUNT_CODE.length > 0;

/**
 * Custom cart action: add the set's lines, then apply the offer's code.
 *
 * Kept registered in the cart route even when the offer is off — a browser
 * holding a cached page from when it was on would otherwise submit an action
 * the route no longer knows, and fall through to the "not defined" throw.
 */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;
