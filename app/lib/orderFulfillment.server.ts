import {getSumUpCheckout} from '~/lib/sumup.server';
import {completeDraftOrder, getDraftOrder} from '~/lib/shopifyAdmin.server';

export type ConfirmResult =
  | {status: 'PAID'; order: {id: string; name: string; confirmationNumber: string}}
  | {status: 'PENDING' | 'FAILED' | 'EXPIRED'};

/**
 * Authoritative confirmation step: re-fetches the checkout status directly
 * from SumUp's API (never trusts a webhook/callback body on its own), then
 * completes the matching Shopify draft order exactly once. Safe to call
 * more than once for the same checkout — completing an already-completed
 * draft order is a no-op that returns the existing order.
 */
export async function confirmSumUpPayment(
  env: Env,
  params: {sumupCheckoutId: string; draftOrderId: string},
): Promise<ConfirmResult> {
  const checkout = await getSumUpCheckout(env, params.sumupCheckoutId);

  if (checkout.status !== 'PAID') {
    return {status: checkout.status === 'EXPIRED' ? 'EXPIRED' : checkout.status === 'FAILED' ? 'FAILED' : 'PENDING'};
  }

  const existing = await getDraftOrder(env, params.draftOrderId);

  if (existing?.order) {
    return {status: 'PAID', order: existing.order};
  }

  const completed = await completeDraftOrder(env, params.draftOrderId);

  if (!completed?.order) {
    // Payment succeeded but order completion failed — surface as pending so
    // the merchant can investigate rather than telling the customer it failed.
    return {status: 'PENDING'};
  }

  return {status: 'PAID', order: completed.order};
}
