/**
 * Second-piece offer — 30% off the second item in the basket.
 *
 * A storefront cannot change a price: what the customer pays is decided by
 * Shopify at cart and checkout. So the offer is driven by a real Shopify
 * discount, and this file only says how to talk about it. The procedure to
 * create that discount is in docs/second-item-offer.md.
 *
 * Everything here is display only. If these figures and the Shopify discount
 * ever disagree, the customer is shown one price and charged another — change
 * both together, never one alone.
 */

/** Percentage taken off the second piece. */
export const SECOND_ITEM_DISCOUNT_PERCENT = 30;

/** Set to false to switch the offer off across the storefront. */
export const OFFER_ENABLED = true;

/**
 * Optional discount **code**.
 *
 * Empty by default, which means the offer runs on a Shopify *automatic*
 * discount: Shopify evaluates the basket itself and the reduction appears with
 * nothing typed and nothing applied by the storefront.
 *
 * Put a code here and app/routes/cart.tsx goes back to attaching it to the
 * cart after every change — useful to restrict the offer to a campaign link.
 * Never run a code and an automatic discount for the same offer at once, or
 * the reductions stack.
 */
export const OFFER_DISCOUNT_CODE: string = '';

/**
 * Custom cart action: adds the pair's two lines in one request.
 *
 * Kept registered in the cart route even when the offer is off — a browser
 * holding a cached page from when it was on would otherwise submit an action
 * the route no longer knows, and fall through to the "not defined" throw.
 */
export const BUNDLE_ADD_ACTION = 'CustomBundleAdd' as const;

/**
 * What the offer takes off a pair, following Shopify's own rule for
 * "buy X get Y": the reduction lands on the **cheapest** eligible item, not on
 * the one the customer happens to have added second.
 *
 * Used for the product page's estimate. The cart doesn't use it — it reports
 * the figure Shopify actually allocated, so the two can never drift.
 */
export function pairSaving(firstAmount: number, secondAmount: number): number {
  if (!OFFER_ENABLED) return 0;
  const cheapest = Math.min(firstAmount, secondAmount);
  return (cheapest * SECOND_ITEM_DISCOUNT_PERCENT) / 100;
}
